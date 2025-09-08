from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from .deepface_model import get_deepface_model
        print("⚡ Preloading SFace model from local weights...")
        try:
            get_deepface_model("SFace")  # loads once from local file
            print("⚡ SFace model loaded from local file")
        except Exception as e:
            print("Model preload failed:", e)
