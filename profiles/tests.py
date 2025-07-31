import io  
import jwt  
from PIL import Image   
from django.urls import reverse  
from rest_framework import status
from django.utils import timezone
from .models import Profile, ProfileToken
from rest_framework.test import APITestCase
from .auth import generateAccessToken, generateRefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile


def generatePhotoFile():
    img = Image.new('RGB', (100, 100), color='red')
    tempFile = io.BytesIO()
    img.save(tempFile, format='PNG')
    tempFile.name = 'test.png'
    tempFile.seek(0) 
    return SimpleUploadedFile('test.png', tempFile.read(), content_type='image/png')


class SignUpTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('signupView')

        self.data = {
            'username' : 'testuser',
            'email'    : 'testuser@example.com',
            'password' : 'Testpass@123',
            'firstName': 'Test',
            'lastName' : 'User',
            'profileIcon' : generatePhotoFile() 
        }

    def test_signup_success(self):
        response = self.client.post(self.url, self.data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

        # check user is created.
        user = Profile.objects.filter(username='testuser').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'testuser@example.com')

        # check cookie is set.
        self.assertIn('refreshToken', response.cookies)
        self.assertTrue(response.cookies['refreshToken']['httponly'])

        # validate token payload.
        token = response.data['token']
        payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        self.assertEqual(payload['id'], user.id)

        # check refresh token is stored.
        self.assertTrue(ProfileToken.objects.filter(userId=user.id).exists())


class SigninTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('loginView')

        self.password = 'Testpass@123'
        self.user = Profile.objects.create_user(
            username    = 'testuser',
            email       = 'testuser@example.com',
            password    = 'Testpass@123',
            guestMode   = False, 
            profileIcon = generatePhotoFile()
        )

    def test_login_success(self):
        response = self.client.post(self.url, {'email' : self.user.email, 'password' : self.password})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

        # Check refresh token.
        self.assertIn('refreshToken', response.cookies)
        self.assertTrue(response.cookies['refreshToken']['httponly'])

        # Check refresh token object.
        self.assertTrue(ProfileToken.objects.filter(userId=self.user.id).exists())

    def test_login_guest_mode(self):
        self.user.guestMode = True
        self.user.save()

        response = self.client.post(self.url, {'email' : self.user.email, 'password' : self.password})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertTrue(response.data.get('guestMode'))

    def test_login_invalid_password(self):
        response = self.client.post(self.url, {'email' : self.user.email, 'password' : 'WrongPass123@'})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Invalid Email or Password !')

    def test_login_missing_fields(self):
        response = self.client.post(self.url, {})

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'user with this email does not exist.')


class RefreshTokenTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('refreshView')

        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.refreshToken = generateRefreshToken(self.user.id)
        self.expiredAt = timezone.now() + timezone.timedelta(days=7)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=self.refreshToken,
            expiredAt=self.expiredAt
        )

    def test_refresh_success(self):
        self.client.cookies['refreshToken'] = self.refreshToken
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('accessToken', response.data)

        payload = jwt.decode(response.data['accessToken'], 'secret', algorithms=['HS256'])
        self.assertEqual(payload['id'], self.user.id)

    def test_refresh_missing_cookie(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Invalid Username or Password!')

    def test_refresh_expired_token(self): 
        ProfileToken.objects.filter(userId=self.user.id).delete()
        expiredToken = generateRefreshToken(self.user.id)
        expiredTime  = timezone.now() - timezone.timedelta(days=1)

        ProfileToken.objects.create(
            userId=self.user.id,
            token=expiredToken,
            expiredAt=expiredTime
        )

        self.client.cookies['refreshToken'] = expiredToken
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Invalid Username or Password!')

    def test_refreshToken_not_in_dB(self): 
        ProfileToken.objects.filter(userId=self.user.id).delete()

        fake_token = generateRefreshToken(self.user.id)
        self.client.cookies['refreshToken'] = fake_token

        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Invalid Username or Password!')

    def test_refresh_invalid_jwt(self):
        self.client.cookies['refreshToken'] = "invalid.jwt.token"
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['detail'], 'Invalid Username or Password!')
    

class ProfileThemeViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('userThemeView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId    = self.user.id,
            token     = self.refreshToken,
            expiredAt = timezone.now() + timezone.timedelta(days=7)
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')
        
    def test_patch_theme_success(self):
        response = self.client.patch(self.url, {'theme' : 'light'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.displayTheme, 'light')

    def test_patch_invalid_value(self):
        response = self.client.patch(self.url, {'theme' : 'blue'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertNotEqual(self.user.displayTheme, 'blue')

    def test_patch_unauthenticated_user(self):
        self.client.credentials()
        response = self.client.patch(self.url, {'theme' : 'dark'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProfileBlogMailToggleViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('userMailPreferenceView')
        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId    = self.user.id,
            token     = self.refreshToken,
            expiredAt = timezone.now() + timezone.timedelta(days=7)
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_toggle_receive_email_on(self):
        response = self.client.patch(self.url, {'receiveMails' : True}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.receiveMails)

    def test_toggle_receive_email_off(self):
        self.user.receiveMails = True
        self.user.save()

        response = self.client.patch(self.url, {'receiveMails' : False}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertFalse(self.user.receiveMails)

    def test_test_toggle_receive_email_unauthenticated(self):
        self.client.credentials()

        response = self.client.patch(self.url, {'receiveMails' : True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ProfileFavouritesToggleViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('bookmarksVisibilityView')

        self.user = Profile.objects.create_user(
            username='testuser',
            email='testuser@example.com',
            password='Testpass@123',
            profileIcon=generatePhotoFile()
        )

        self.accessToken = generateAccessToken(self.user.id)
        self.refreshToken = generateRefreshToken(self.user.id)

        ProfileToken.objects.create(
            userId    = self.user.id,
            token     = self.refreshToken,
            expiredAt = timezone.now() + timezone.timedelta(days=7)
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.accessToken}')

    def test_favourite_toggle_on(self):
        self.user.favourites = False
        self.user.save()

        response = self.client.patch(self.url, {'favourites' : True}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.favourites) 
 
    def test_favourite_toggle_off(self):
        self.user.favourites = True
        self.user.save()

        response = self.client.patch(self.url, {'favourites' : False}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.favourites)

    def test_favourite_toggle_unauthenticated_access(self):
        self.client.credentials()

        response = self.client.patch(self.url, {'favourites' : True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class LogoutViewTestCase(APITestCase):
    def setUp(self):
        self.url = reverse('logoutView')
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

    def test_logout_success(self):
        response = self.client.post(self.url)
 
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Successfully Logged Out!')

        refreshCookie = response.cookies.get('refreshToken')
        self.assertIsNotNone(refreshCookie)
        self.assertEqual(refreshCookie.value, '')
        self.assertEqual(refreshCookie['max-age'], 0)