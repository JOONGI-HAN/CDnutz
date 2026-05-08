"""
Initializing Django for the external services that use it
"""
from pathlib import Path
import django
import sys
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent

sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CDnutz_project.settings')
django.setup()
