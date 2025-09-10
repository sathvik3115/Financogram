from django.urls import path
from . import views


urlpatterns = [
    path('', views.root_view, name='root_view'),
    path('hello/', views.hello_world, name='hello_world'),
    path('login/', views.login_user, name='login_user'),
    path('register/', views.register_user, name='register_user'),
    path('login-face/', views.login_face_view, name='login_face'),
    path('send-mail/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('check-username', views.check_username, name='check_username'),
    path('user-profile/', views.user_profile, name='user_profile'),
    path('logout/', views.logout_view, name='logout'),
    path('update-wallet/', views.update_wallet, name='update_wallet'),
    path('update-profile/', views.update_profile, name='update_profile'),
]
