from django.apps import AppConfig
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from deepface import DeepFace

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        from . import login_face
        login_face.models  # Preload model at startup
