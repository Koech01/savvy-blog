import jwt, datetime
from .models import Profile
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from rest_framework.authentication import get_authorization_header


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if auth and len(auth) == 2:
            token = auth[1].decode('utf-8')

            try:
                payload = jwt.decode(token, 'secret', algorithms=['HS256'])
            except jwt.ExpiredSignatureError:
                raise AuthenticationFailed('Token has expired')
            except jwt.DecodeError:
                raise AuthenticationFailed('Invalid token')
            
            try:
                profile = Profile.objects.get(id=payload.get('id'))
            except Profile.DoesNotExist:
                raise AuthenticationFailed('User profile not found')
            return (profile, None)
        
        raise AuthenticationFailed('Profile Unauthenticated')


def generateAccessToken(profileId):
    payload = {
        'id'  : profileId,
        'exp' : datetime.datetime.now() + datetime.timedelta(days=1),
        'iat' : datetime.datetime.now()
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')
    return token


def generateRefreshToken(profileId):
    payload = {
        'id'  : profileId,
        'exp' : datetime.datetime.now() + datetime.timedelta(days=7),
        'iat' : datetime.datetime.now()
    }
    token = jwt.encode(payload, 'secret', algorithm='HS256')
    return token