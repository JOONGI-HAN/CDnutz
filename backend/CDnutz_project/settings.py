from pathlib import Path
import os
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(f"{BASE_DIR}/.env")

SECRET_KEY      = os.getenv("secret_key")

DEBUG           = True

ALLOWED_HOSTS   = ['*']

INSTALLED_APPS  = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'CDnutz_auth',
    'CDnutz_core',
]

MIDDLEWARE      = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://192.168.1.5:5173",
]

ROOT_URLCONF    = 'CDnutz_project.urls'

TEMPLATES       = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION        = 'CDnutz_project.wsgi.application'

DATABASES               = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("name"),
        'USER': os.getenv("user"),
        'PASSWORD': os.getenv("password"),
        'HOST': '127.0.0.1',
        'PORT': '5432'
    }
}

SESSION_ENGINE           = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS      = "default"

CACHES                   = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        # 1 means "database 1"
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

AUTHENTICATION_BACKENDS = [
    "CDnutz_auth.backends.CustomAuthenticationBackend"
]

AUTH_USER_MODEL = "CDnutz_auth.CustomUser"

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE    = 'en-us'

TIME_ZONE        = 'UTC'

USE_I18N         = True

USE_TZ           = True

STATIC_URL       = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL        = '/media/'
MEDIA_ROOT       = os.path.join(BASE_DIR, 'media')
