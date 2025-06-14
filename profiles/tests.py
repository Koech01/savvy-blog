import io
import tempfile
from PIL import Image 
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from .models import Profile, ProfileToken
from rest_framework.test import APITestCase
from django.core.files.uploadedfile import SimpleUploadedFile


class AuthTestCase(APITestCase):
    def generatePhotoFile(self):
        img = Image.new('RGB', (100, 100), color='red')
        tempFile = io.BytesIO()
        img.save(tempFile, format='PNG')
        tempFile.name = 'test.png'
        tempFile.seek(0) 
        return SimpleUploadedFile('test.png', tempFile.read(), content_type='image/png')
    
    def testSignup(self):
        url = reverse('signup')
        data = {
            'username' : 'testuser',
            'email'    : 'testuser@example.com',
            'password' : 'Testpass@123',
            'firstName': 'Test',
            'lastName' : 'User',
            'profileIcon' : self.generatePhotoFile() 
        }

        response = self.client.post(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertTrue(Profile.objects.filter(username='testuser').exists())


    def testProfileView(self):
        user = Profile.objects.create_user(
            username='testuser', 
            email='testuser@example.com', 
            password='Testpass@123',
            profileIcon=self.generatePhotoFile() 
        )

        self.client.force_authenticate(user=user)
        url = reverse('profileView')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], user.username)