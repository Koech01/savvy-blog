from django.urls import path
from .views import HomeView, TopicCategoriesView, TopicsByProfileView, TopicsByCategoryView, RemoveProfileTopicsView, AddProfileTopicsView, ProfileBlogsView, FetchBlogsView, BookmarkBlogView, BookmarksView
 
urlpatterns = [
    path('v1/home/'  , HomeView.as_view(), name='homeView'),
    path('v1/topics/user/add/', TopicCategoriesView.as_view(), name='topicCategoriesView'),
    path('v1/topics/', TopicsByCategoryView.as_view(), name='topicsByCategoryView'),
    path('v1/topics/list/', TopicsByProfileView.as_view(), name='topicsByProfileView'),
    path('v1/topics/add/', AddProfileTopicsView.as_view(), name='addProfileTopicsView'),
    path('v1/topics/remove/', RemoveProfileTopicsView.as_view(), name='removeProfileTopicsView'),
    path('v1/explore/blogs/', FetchBlogsView.as_view(), name='allBlogsView'),
    path('v1/user/blogs/', ProfileBlogsView.as_view(), name='profileBlogsView'),
    path('v1/blog/<int:blogId>/bookmark/', BookmarkBlogView.as_view(), name='bookmarkBlogView'),
    path('v1/user/bookmarks/', BookmarksView.as_view(), name='bookmarksView'),
]