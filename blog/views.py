from datetime import datetime 
from rest_framework import status
from profiles.models import Profile
from .serializers import BlogSerializer
from rest_framework.views import APIView 
from .site.site2 import sciencenewScraper
from .site.site1 import livescienceScraper
from profiles.views import profileBlogMail
from profiles.auth import JWTAuthentication
from rest_framework.response import Response
from django.db.models.functions import Random
from rest_framework.exceptions import NotFound
from profiles.serializers import ProfileSerializer
from .imports import addingTopicCategoriesAndTopicsToDb
from .models import TopicCategory, Topic, Blog, Bookmark
from apscheduler.schedulers.background import BackgroundScheduler
from .serializers import TopicSerializer, TopicCategorySerializer, BlogBookmarkSerializer


class HomeView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)
    

class TopicCategoriesView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        categories         = TopicCategory.objects.all()
        categorySerializer = TopicCategorySerializer(categories, many=True)

        #addingTopicCategoriesAndTopicsToDb()

        return Response({
            'message'   : 'User added to topics successfully.',
            'categories': categorySerializer.data
        }, status=status.HTTP_200_OK)


class TopicsByCategoryView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        topicCategoryName = request.query_params.get('category')

        if topicCategoryName is None:
            return Response({'error': 'Category name is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            category   = TopicCategory.objects.get(name=topicCategoryName)
            topics     = Topic.objects.filter(category=category)
            serializer = TopicSerializer(topics, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except TopicCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)


class TopicsByProfileView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request): 
        try:
            profile    = Profile.objects.get(username=request.user)
            topics     = Topic.objects.filter(users=profile)
            serializer = TopicSerializer(topics, many=True)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error' : 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


class AddProfileTopicsView(APIView):
    authentication_classes = [JWTAuthentication]

    def patch(self, request):
        try:
            profile = Profile.objects.get(username=request.user)
        except Profile.DoesNotExist:
            return Response({'error':'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        selectedTopics = request.data.get('selectedTopics', {})
        for topicId, isSelected in selectedTopics.items():
            if isSelected:
                try:
                    topic = Topic.objects.get(pk=topicId)
                    topic.users.add(profile)
                    topic.save()
                except Topic.DoesNotExist:
                    return Response({'error':'User not added to topic.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Selected topics saved.'}, status=status.HTTP_200_OK)
    

class RemoveProfileTopicsView(APIView):
    authentication_classes = [JWTAuthentication]

    def patch(self, request):
        profile        = Profile.objects.get(username=request.user)
        selectedTopics = request.data.get('selectedTopics', [])

        for topicId in selectedTopics:
            try:
                topic = Topic.objects.get(pk=topicId)
                topic.users.remove(profile)  
                topic.save()
            except Topic.DoesNotExist:
                return Response({'error':'Topic does not exist.'}, status=status.HTTP_404_NOT_FOUND) 
        return Response({'message': 'Selected topics removed.'}, status=status.HTTP_200_OK)


class FetchBlogsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            Profile.objects.get(username=request.user)
        except Profile.DoesNotExist:
            return Response({'error':'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        topicContent  = Blog.objects.order_by('?')[:50]
        serializer    = BlogSerializer(topicContent, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


currentFunctionIndex = 0
webScraperFunctions  = [livescienceScraper, sciencenewScraper]
jobRunning           = False

def jobWrapper(request):
    global jobRunning, currentFunctionIndex
    if not jobRunning:
        jobRunning = True
        try:
            functionToCall = webScraperFunctions[currentFunctionIndex]
            functionToCall(request)
        finally:
            jobRunning = False
            # Update the function index to the next one (cycle through the list)
            currentFunctionIndex = (currentFunctionIndex + 1) % len(webScraperFunctions)


class ProfileBlogsView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request): 
        scheduler = BackgroundScheduler()

        if Blog.objects.exists():
            intervalSeconds = 10
        else:
            intervalSeconds = 5

        scheduler.add_job(
            jobWrapper, 'interval', args=[request], seconds=intervalSeconds, next_run_time=datetime.now()
        )
        scheduler.start() 
        profileBlogMail(request)

        try:
            profile       = Profile.objects.get(username=request.user)
            profileTopics = Topic.objects.filter(users=profile)
            topicContent  = Blog.objects.filter(topic__in=profileTopics).order_by('?')[:50]
            serializer    = BlogSerializer(topicContent, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK) 
        except Profile.DoesNotExist:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
  

class BookmarkBlogView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request, blogId):
        try:
            profile = Profile.objects.get(username=request.user)
            blog    = Blog.objects.get(id=blogId)
            
            bookmark, created = Bookmark.objects.get_or_create(user=profile, blog=blog)
            if not created:
                bookmark.delete()
                return Response({'message': 'Bookmark removed.'}, status=status.HTTP_200_OK)
            
            serializer = BlogBookmarkSerializer(bookmark)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Blog.DoesNotExist:
            return Response({'message': 'Blog not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Profile.DoesNotExist:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BookmarksView(APIView):
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        try:
            profile   = Profile.objects.get(username=request.user)
            bookmarks = Bookmark.objects.filter(user=profile)
            if not bookmarks:
                return Response({'message': 'Bookmarks empty.'}, status=status.HTTP_404_NOT_FOUND)
            bookmarkedBlogs = [bookmark.blog for bookmark in bookmarks]
            serializer      = BlogSerializer(bookmarkedBlogs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)