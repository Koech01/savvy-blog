from django.urls import path
from .views import SignUpView, LoginView, ProfileUpdateView, ProfileThemeView, ProfileBlogMailToggleView
from .views import LogoutView, RefreshApiView, ForgotPasswordView, ResetPasswordView, ProfileFavouritesToggleView

urlpatterns = [
    path('refresh/'  , RefreshApiView.as_view(), name='refresh'),
    path('v1/signup/', SignUpView.as_view(), name='signup'),
    path('v1/login/' , LoginView.as_view(), name='login'),
    path('v1/logout/', LogoutView.as_view(), name='logout'),
    path('v1/forgot/', ForgotPasswordView.as_view(), name='forgot'),
    path('v1/reset/', ResetPasswordView.as_view(), name='reset'),
    path('v1/user/details/', ProfileUpdateView.as_view(), name='userUpdateView'),
    path('v1/user/theme/', ProfileThemeView.as_view(), name='userThemeView'),
    path('v1/user/mail/preferences/', ProfileBlogMailToggleView.as_view(), name='userMailPreferenceView'),
    path('v1/user/bookmarks/visibility/', ProfileFavouritesToggleView.as_view(), name='bookmarksVisibilityView'),
]