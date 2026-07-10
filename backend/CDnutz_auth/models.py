from django.db import models

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager

from django.core.exceptions import ValidationError


class CustomUser(AbstractUser):
    username      = models.CharField(max_length = 150, unique = True, error_messages = {"unique" : "A user with that username already exists."})
    email_address = models.EmailField(unique = True, blank = False, null = False)

    USERNAME_FIELD  = "email_address"  # which field correctly identifies a user? use email to authenticate instead of username for login
    REQUIRED_FIELDS = ["username"]  # strictly used by django create_superuser, which fields are required to create an admin account besides the username_field and password

    objects = UserManager()  # this UserManager object is different from models.Manager objects, it gives us access to methods like create_user which hashes passwords


    def clean(self):
        super().clean()

        # since I allow users to login via both username and email, it is important to disallow usernames to be in email formats
        # test case userA = {username = "john", email = "john@example.com"} | userB = {username = "john@example.com", email = bob@example.com}
        # then backends.CustomAuthenticationBackend's model filter would return both of them, and .first() would pick the first instance [NOT SAFE]
        if "@" in self.username:
            raise ValidationError(
                {
                    "username" : "Username cannot contain '@' symbol"
                }
            )


    def save(self, *args, **kwargs):
        # by default django's save() method doesn't call full_clean which would in turn call our clean method
        self.full_clean()

        super().save(*args, **kwargs)


    def __str__(self):
        return self.username


    class Meta:
        verbose_name  = "User"
        db_table      = 'CDnutz_users'  # terrible name, I know, but it is the convention from when I started this project
        get_latest_by = 'date_joined'
        ordering      = ['-date_joined']
        permissions   = [
            ("can_upload_new_games", "Can upload new games"),
            ("can_edit_old_games", "Can edit old games")
        ]  # I have been thinking of adding this feature, letting specific upload new games to our database
