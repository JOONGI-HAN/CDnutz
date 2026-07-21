from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only = True)

    @staticmethod
    def validate_username(value):
        if "@" in value or " " in value:
            raise serializers.ValidationError("Username cannot contain '@' symbol or an empty space.")
        return value

    @staticmethod
    def validate_password(value):
        try:
            # explicitly trigger settings.py password validators
            # This calls the validators in AUTH_PASSWORD_VALIDATORS
            validate_password(value)
        except ValidationError as e:
            # Django returns a list of error messages, we pass them to DRF error handler
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords must match.'
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password') # our CustomUser repr *doesn't* have any confirm_pass field

        user = CustomUser.objects.create_user(**validated_data)

        return user

    class Meta:
        model  = CustomUser
        fields = ['first_name', 'last_name', 'username', 'email_address', 'password', 'confirm_password']
        extra_kwargs = { # we *don't* want to send password to in the API response, set it to write_only
            'password': {
                'write_only' : True
            }
        }