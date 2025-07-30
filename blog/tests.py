import io   
from PIL import Image   
from django.urls import reverse  
from rest_framework import status
from django.utils import timezone  
from rest_framework.test import APITestCase
from profiles.models import Profile, ProfileToken
from .models import TopicCategory, Topic, Blog, Bookmark
from django.core.files.uploadedfile import SimpleUploadedFile
from profiles.auth import generateAccessToken, generateRefreshToken


def generatePhotoFile():
    img = Image.new('RGB', (100, 100), color='red')
    tempFile = io.BytesIO()
    img.save(tempFile, format='PNG')
    tempFile.name = 'test.png'
    tempFile.seek(0) 
    return SimpleUploadedFile('test.png', tempFile.read(), content_type='image/png')


class HomeViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('homeView')

        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_home_view_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url) 
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TopicsByCategoryViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('topicsByCategoryView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )

        self.category1 = TopicCategory.objects.create(name='Science')
        self.category2 = TopicCategory.objects.create(name='Art')

        self.topic1 = Topic.objects.create(name='Physics')
        self.topic2 = Topic.objects.create(name='Biology')
        self.topic3 = Topic.objects.create(name='Painting')

        self.topic1.category.set([self.category1])
        self.topic2.category.set([self.category1])
        self.topic3.category.set([self.category2])
 
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_fetch_topics_by_invalid_category(self):
        response = self.client.get(self.url, {'category' : 'Science'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response), 2)

        topicNames = [topic['name'] for topic in response.data]
        self.assertIn('Physics', topicNames)
        self.assertIn('Biology', topicNames)

    def test_fetch_topics_by_invalid_category(self):
        response = self.client.get(self.url, {'cateogry' : 'Automotive'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Category name is required')

    def test_fetch_topics_missing_category_param(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Category name is required')

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url, {'category' : 'Science'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TopicsByProfileViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('topicsByProfileView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7) 
        )

        self.category1 = TopicCategory.objects.create(name='Science') 

        self.topic1 = Topic.objects.create(name='Physics')
        self.topic2 = Topic.objects.create(name='Biology') 

        self.topic1.category.set([self.category1])
        self.topic2.category.set([self.category1]) 

        self.topic1.users.add(self.user)
        self.topic2.users.add(self.user) 

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_fetch_topics_by_profile(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        topicNames = [topic['name'] for topic in response.data]
        self.assertIn('Physics', topicNames)
        self.assertIn('Biology', topicNames)

    def test_fetch_topics_by_profile_none(self): 
        self.topic1.users.clear()
        self.topic2.users.clear()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AddProfileTopicsViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('addProfileTopicsView')

        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )
  
        self.category1 = TopicCategory.objects.create(name='Science') 

        self.topic1 = Topic.objects.create(name='Physics')
        self.topic2 = Topic.objects.create(name='Biology') 

        self.topic1.category.set([self.category1])
        self.topic2.category.set([self.category1]) 

        self.topic1.users.add(self.user)
        self.topic2.users.add(self.user) 

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_add_profile_to_selected_topics(self):
        payload = { 
            'selectedTopics' : {
                str(self.topic1.id): True,
                str(self.topic2.id): True
            }
        }

        response = self.client.patch(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(self.user, self.topic1.users.all())
        self.assertIn(self.user, self.topic2.users.all())
        self.assertEqual(response.data['message'], 'Selected topics saved.')

    def test_add_profile_to_invalid_topic(self):
        payload = { 'selectedTopics' : { '9999' : True } }

        response = self.client.patch(self.url, data=payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'User not added to topic.')

    def test_unauthenticated_access(self):
        self.client.credentials()

        payload = {'selectedTopics' : { str(self.topic1.id) : True } }
        response = self.client.patch(self.url, data=payload, format='json') 
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class RemoveProfileTopicsViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('removeProfileTopicsView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )

        self.category1 = TopicCategory.objects.create(name='Science') 

        self.topic1 = Topic.objects.create(name='Physics')
        self.topic2 = Topic.objects.create(name='Biology') 

        self.topic1.category.set([self.category1])
        self.topic2.category.set([self.category1]) 

        self.topic1.users.add(self.user)
        self.topic2.users.add(self.user) 

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_remove_profile_from_topics_object(self):
        payload = { 'selectedTopics' : [str(self.topic1.id), str(self.topic2.id)] }

        response = self.client.patch(self.url, data=payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn(self.user.id, self.topic1.users.all())
        self.assertNotIn(self.user.id, self.topic2.users.all())
        self.assertEqual(response.data['message'], 'Selected topics removed.')

    def test_remove_profile_from_invalid_topic(self):
        payload = { 'selectedTopics' : ['9999'] }
        response = self.client.patch(self.url, data=payload, format='json') 

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Topic does not exist.')

    def test_unauthenticated_access(self):
        self.client.credentials()

        payload = { 'selectedTopics' : [str(self.topic1.id), str(self.topic2.id)] }
        response = self.client.patch(self.url, data=payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class FetchBlogsViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('allBlogsView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )
 
        self.category = TopicCategory.objects.create(name='Tech')
        self.topic1 = Topic.objects.create(name='AI')
        self.topic2 = Topic.objects.create(name='ML')

        self.topic1.category.set([self.category])
        self.topic2.category.set([self.category])
 
        self.topic1.users.add(self.user)
        self.topic2.users.add(self.user)
 
        self.blog1 = Blog.objects.create(
            title='Intro to AI',
            text='This is a blog on AI.',
            url='http://random.com/ai'
        )
        self.blog2 = Blog.objects.create(
            title='Intro to ML',
            text='This is a blog on ML.',
            url='http://random.com/ml'
        )
        self.blog1.topic.set([self.topic1])
        self.blog2.topic.set([self.topic2])

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_fetch_blogs_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        blogs = [blog['text'] for blog in response.data]
        self.assertIn('This is a blog on AI.', blogs)
        self.assertIn('This is a blog on ML.', blogs)

    def test_fetch_no_blogs(self): 
        self.blog1.delete()
        self.blog2.delete()

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url) 
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProfileBlogsViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('profileBlogsView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )
 
        self.category = TopicCategory.objects.create(name='Tech')
        self.topic1 = Topic.objects.create(name='AI')
        self.topic2 = Topic.objects.create(name='ML')
        self.topic1.category.set([self.category])
        self.topic2.category.set([self.category])
 
        self.topic1.users.add(self.user)
        self.topic2.users.add(self.user)
 
        self.blog1 = Blog.objects.create(
            title='Intro to AI',
            text='This is a blog on AI.',
            url='http://random.com/ai'
        )
        self.blog2 = Blog.objects.create(
            title='Intro to ML',
            text='This is a blog on ML.',
            url='http://random.com/ml'
        )
        self.blog1.topic.set([self.topic1])
        self.blog2.topic.set([self.topic2])

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_fetch_profile_blogs_success(self):
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        titles = [blog['title'] for blog in response.data]
        self.assertIn('Intro to AI', titles)
        self.assertIn('Intro to ML', titles)

    def test_get_profile_blogs_no_matching_topics(self):
        self.topic1.users.remove(self.user)
        self.topic2.users.remove(self.user)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class BookmarkBlogViewTestCase(APITestCase):
    def setUp(self):
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )

        self.blog = Blog.objects.create(
            title='Test Blog',
            text='Some test content',
            url='http://example.com/blog' 
        )

        self.url = reverse('bookmarkBlogView', kwargs={'blogId': self.blog.id})

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_add_bookmark(self):  
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['blog'], self.blog.id)

    def test_remove_bookmark(self): 
        self.client.post(self.url)

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Bookmark removed.')
 
    def test_invalid_id(self):
        url = reverse('bookmarkBlogView', kwargs={'blogId' : '9999'})

        response = self.client.post(url) 
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Blog not found.')
 
    def test_unauthenticated_access(self): 
        self.client.credentials() 
        response = self.client.post(self.url) 
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 


class BookmarksViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('bookmarksView')

        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=timezone.now() + timezone.timedelta(days=7)
        )

        self.blog = Blog.objects.create(
            title='Test Blog',
            text='Some test content',
            url='http://example.com/blog' 
        )

        self.bookmark = Bookmark.objects.create(user=self.user, blog=self.blog)
   
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_fetch_bookmarks(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['title'], 'Test Blog')
        self.assertEqual(len(response.data), 1)

    def test_fetch_no_bookmark(self):
        Bookmark.objects.all().delete()

        response = self.client.get(self.url) 
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], 'Bookmarks empty.')

    def test_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.get(self.url) 
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)