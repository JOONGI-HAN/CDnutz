from django.db import models

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager

from django.core.exceptions import ValidationError


class CustomUser(AbstractUser):
    email_address = models.EmailField(unique = True, blank = False, null = False)

    USERNAME_FIELD  = "email_address" # which field correctly identifies a user? use email to authenticate instead of username for login
    REQUIRED_FIELDS = [] # strictly used by django create_superuser, which fields are required to create an admin account besides the username_field and password

    objects = UserManager() # this UserManager object is different than models.Manager objects, it gives us access to methods like create_user which hashes passwords




    def clean(self):
        super().__init__()

        # since I allow users to login via both username and email, it is important to disallow usernames to be in email formats
        # test case userA = {username = "john", email = "john@example.com"} | userB = {username = "john@example.com", email = bob@example.com}
        # then backends.CustomAuthenticationBackend's model filter would return both of them, and .first() would pick the first instance [NOT SAFE]
        if "@" in self.username:
            raise ValidationError(
                {
                    "username" : "Username cannot contain '@' symbol"
                }
            )