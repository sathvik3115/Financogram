from django.db import models
from django.utils import timezone

class User(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=20, unique=True, default="financogram_user")
    mobile = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    
    # Store Cloudinary URLs instead of local file paths
    face_image = models.URLField(max_length=500, null=True, blank=True)
    profile_image = models.URLField(max_length=500, null=True, blank=True)
    qr_code = models.URLField(max_length=500, null=True, blank=True)
    
    date_joined = models.DateField(default=timezone.now)
    balance = models.CharField(max_length=10, default="0.00")

    def __str__(self):
        return self.email
