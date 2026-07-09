from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import CustomUser


# allow user to login via both username and email, to do so, I needed to override authentication_backend
class CustomAuthenticationBackend(ModelBackend):
    def authenticate(self, request, username = None, password = None, **kwargs):
        identifier = username

        user = CustomUser.objects.filter(
            Q(username = identifier) | Q(email_address = identifier)
        ).first()

        if user and user.check_password(password):
            return user

        return None