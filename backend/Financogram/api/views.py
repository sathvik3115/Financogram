from .login_face import decode_base64_image, verify_face
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from tempfile import NamedTemporaryFile
from django.contrib.auth import logout
from django.http import JsonResponse
from django.core.cache import cache
from django.core.files import File
from rest_framework import status
from django.conf import settings
import cloudinary.uploader
from .models import User
from io import BytesIO
from PIL import Image
import cloudinary
import tempfile
import requests
import random
import base64
import qrcode
import os


# This is a simple view to test if the backend is working
@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

# Register a new user with face image and QR code generation
@api_view(['POST'])
def register_user(request):
    try:
        data = request.data
        print("Received data:", data)

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        face_data = data.get('face_image')

        if not all([name, email, password, face_data]):
            return JsonResponse({'status': 'Missing fields'}, status=400)

        # Process base64 face image
        if ';base64,' in face_data:
            format, imgstr = face_data.split(';base64,')
            img_data = base64.b64decode(imgstr)

            # Upload face image directly to Cloudinary
            face_upload = cloudinary.uploader.upload(
                BytesIO(img_data),
                folder="faces",
                public_id=f"{email}_face",
                overwrite=True,
                resource_type="image"
            )
            face_image_url = face_upload["secure_url"]

            # Generate QR code with embedded text
            qr_content = f"Name: {name}\nEmail: {email}\nPassword: {password}"
            qr_img = qrcode.make(qr_content).convert("RGB")

            try:
                face_img = Image.open(BytesIO(img_data)).resize((80, 80))
                qr_width, qr_height = qr_img.size
                pos = ((qr_width - face_img.width) // 2, (qr_height - face_img.height) // 2)
                qr_img.paste(face_img, pos)
            except Exception as e:
                print("Face embedding into QR failed:", str(e))

            # Convert QR image to bytes and upload to Cloudinary
            buffer = BytesIO()
            qr_img.save(buffer, format="PNG")
            buffer.seek(0)

            qr_upload = cloudinary.uploader.upload(
                buffer,
                folder="qr_codes",
                public_id=f"{email}_qr",
                overwrite=True,
                resource_type="image"
            )
            qr_code_url = qr_upload["secure_url"]

            global name1
            global email1
            global password1
            global face_image1
            global profile_image1
            global qr_code1

            import random

            name1 = name
            email1 = email
            password1 = password
            face_image1 = face_image_url
            profile_image1 = face_image_url
            qr_code1 = qr_code_url
            
                
            return JsonResponse({'status': 'Almost there!\nRedirecting to Mobile Number Verification...'}, status=200)
        else:
            return JsonResponse({'status': 'Invalid image format'}, status=400)

    except Exception as e:
        print("Error during registration:", str(e))
        return JsonResponse({'status': 'Internal server error', 'error': str(e)}, status=500)

# Login a user with email and password (optional)
@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    try:
        user = User.objects.get(email=email, password=password)
        return Response({'status': 'Login successful'})
    except User.DoesNotExist:
        return Response({'status': 'Invalid credentials'}, status=401)
    
# Login a user with face image and email password
@api_view(['POST'])
def login_face_view(request):
    data = request.data
    password = data.get('password')
    email = data.get('email')
    face_data_url = data.get('face_image')

    if not email or not password or not face_data_url:
        return JsonResponse({'status': 'Missing fields or image data'}, status=400)

    try:
        user = User.objects.get(email=email)

        # Check password (⚠️ use proper hashing in production!)
        if user.password != password:
            return JsonResponse({'status': 'Invalid credentials'}, status=401)

        # Decode live webcam image (base64 -> NumPy array)
        live_img = decode_base64_image(face_data_url)

        # Download stored face image
        if not user.face_image:
            return JsonResponse({'status': 'Face image not found'}, status=404)

        response = requests.get(user.face_image)
        if response.status_code != 200:
            return JsonResponse({'status': 'Failed to fetch stored face image'}, status=500)

        tmp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        try:
            tmp_file.write(response.content)
            tmp_file.close()

            # Face verification
            is_verified = verify_face(live_img, tmp_file.name)

            if is_verified:
                return JsonResponse({'status': 'Login successful!', 'email': user.email})
            else:
                return JsonResponse({'status': 'Face verification failed!'}, status=401)

        finally:
            if os.path.exists(tmp_file.name):
                os.remove(tmp_file.name)

    except User.DoesNotExist:
        return JsonResponse({'status': 'User not found'}, status=404)
    except Exception as e:
        print("Error in login_face_view:", str(e))
        return JsonResponse({'status': 'Internal server error', 'error': str(e)}, status=500)

# Get user profile with face image and QR code URLs
@api_view(['GET'])
def user_profile(request):
    email = request.GET.get('email')  # ✅ get email from URL query string
    if not email:
        return JsonResponse({'error': 'Email not provided'}, status=400)

    try:
        user = User.objects.get(email=email)
        # image_url = request.build_absolute_uri(user.face_image.url) if user.face_image else None
        # qr_code_url = request.build_absolute_uri(user.qr_code.url) if user.qr_code else None
        # profile_url = request.build_absolute_uri(user.profile_image.url) if user.profile_image else None

        return JsonResponse({
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "mobile": user.mobile,
            # "face_image": image_url,
            # "qr_code": qr_code_url,
            # "profile_image": profile_url,
            "face_image": user.face_image,
            "qr_code": user.qr_code,
            "profile_image": user.profile_image,
            "date_joined": user.date_joined,
            "balance": user.balance
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    
# Send OTP to user's email for verification
@api_view(['POST'])
def send_otp(request):
    email = request.data.get('email')
    name = request.data.get('name')
    
    if not email:
        return Response({"success": False, "message": "Email is required"})

    global otp
    otp = str(random.randint(100000, 999999))
    cache.set(email, otp, timeout=120)  # store for 2 mins

    # Send email (customize this)
    send_mail(
        subject='Email Verification by FINANCOGRAM',
        message=f"""Hi {name},

    We would like to inform you that your registration is currently being processed.
    {otp} is the One-Time Password (OTP) to complete your email verification. It is valid for 2 minutes.
    Kindly enter the OTP for email verification. Please do not share it with anyone for security reasons.
    If not initiated by you, call +91 6359630820 immediately.

    Always open to help you.

    Regards,
    FINANCOGRAM team.""",
        from_email='financogram@gmail.com',
        recipient_list=[email],
        fail_silently=False,
        html_message=f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>FINANCOGRAM - Email Verification</title>
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%);
                    color: #ffffff;
                    line-height: 1.6;
                }}
                
                .email-container {{
                    max-width: 800px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(0, 191, 255, 0.3);
                }}
                
                .header {{
                    background: linear-gradient(45deg, #00bfff, #00ff99);
                    padding: 1rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }}
                
                .header::before {{
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                    animation: shimmer 3s ease-in-out infinite;
                }}
                
                @keyframes shimmer {{
                    0%, 100% {{ transform: rotate(0deg); }}
                    50% {{ transform: rotate(180deg); }}
                }}
                
                .logo {{
                    font-size: 2.5rem;
                    font-weight: 900;
                    color: #000;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                    margin-bottom: 0.5rem;
                    position: relative;
                    z-index: 1;
                }}
                
                .tagline {{
                    font-size: 1.1rem;
                    color: #000;
                    font-weight: 600;
                    position: relative;
                    z-index: 1;
                }}
                
                .content {{
                    padding: 3rem 2rem;
                    text-align: center;
                }}
                
                .welcome-text {{
                    font-size: 2rem;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 1rem;
                }}
                
                .description {{
                    color: #cccccc;
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                    line-height: 1.8;
                }}
                
                .otp-container {{
                    background: linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 255, 153, 0.1) 100%);
                    border: 2px solid rgba(0, 191, 255, 0.3);
                    border-radius: 15px;
                    padding: 2rem;
                    margin: 2rem 0;
                    position: relative;
                    overflow: hidden;
                }}
                
                .otp-container::before {{
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(0, 191, 255, 0.2), transparent);
                    animation: slide 2s ease-in-out infinite;
                }}
                
                @keyframes slide {{
                    0% {{ left: -100%; }}
                    50% {{ left: 100%; }}
                    100% {{ left: 100%; }}
                }}
                
                .otp-label {{
                    font-size: 1.2rem;
                    color: #00bfff;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }}
                
                .otp-code {{
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: #ffffff;
                    text-shadow: 0 0 20px rgba(0, 191, 255, 0.5);
                    letter-spacing: 8px;
                    margin: 1rem 0;
                    background: linear-gradient(45deg, #00bfff, #00ff99);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: glow 2s ease-in-out infinite alternate;
                }}
                
                @keyframes glow {{
                    from {{ filter: drop-shadow(0 0 10px rgba(0, 191, 255, 0.5)); }}
                    to {{ filter: drop-shadow(0 0 20px rgba(0, 255, 153, 0.5)); }}
                }}
                
                .otp-validity {{
                    font-size: 0.9rem;
                    color: #ff6b6b;
                    font-weight: 600;
                    margin-top: 1rem;
                }}
                
                .security-notice {{
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 77, 77, 0.1) 100%);
                    border: 1px solid rgba(255, 107, 107, 0.3);
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 2rem 0;
                }}
                
                .security-title {{
                    color: #ff6b6b;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }}
                
                .security-text {{
                    color: #cccccc;
                    font-size: 0.95rem;
                }}
                
                .contact-info {{
                    background: linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, rgba(0, 255, 153, 0.1) 100%);
                    border: 1px solid rgba(0, 191, 255, 0.3);
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin: 2rem 0;
                }}
                
                .contact-title {{
                    color: #00bfff;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }}
                
                .contact-text {{
                    color: #cccccc;
                    font-size: 0.95rem;
                }}
                
                .footer {{
                    background: linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(42, 42, 42, 0.9) 100%);
                    padding: 2rem;
                    text-align: center;
                    border-top: 1px solid rgba(0, 191, 255, 0.2);
                }}
                
                .footer-signature {{
                    color: #00bfff;
                    font-weight: 700;
                    font-size: 1.1rem;
                }}
                
                @media (max-width: 600px) {{
                    .email-container {{
                        margin: 1rem;
                        border-radius: 15px;
                    }}
                    
                    .header {{
                        padding: 1.5rem;
                    }}
                    
                    .logo {{
                        font-size: 2rem;
                    }}
                    
                    .content {{
                        padding: 2rem 1rem;
                    }}
                    
                    .otp-code {{
                        font-size: 2.5rem;
                        letter-spacing: 4px;
                    }}
                }}
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="logo">FINANCOGRAM</div>
                    <div class="tagline">AI-Powered Financial Platform</div>
                </div>
                
                <div class="content">
                    <div class="welcome-text">Welcome to FINANCOGRAM!</div>
                    <div class="description">
                        Thank you for choosing FINANCOGRAM for your financial journey.
                        <br>
                        To complete your registration, please verify your email address using the OTP below.
                    </div>
                    
                    <div class="otp-container">
                        <div class="otp-label">Your Verification Code</div>
                        <div class="otp-code">{otp}</div>
                        <div class="otp-validity">Valid for 2 minutes only</div>
                    </div>
                    
                    <div class="security-notice">
                        <div class="security-title">Security Notice</div>
                        <div class="security-text">
                            • Never share this OTP with anyone<br>
                            • FINANCOGRAM team will never ask for your OTP<br>
                            • If you didn't request this, please contact us immediately
                        </div>
                    </div>
                    
                    <div class="contact-info">
                        <div class="security-title">Need Help?</div>
                        <div class="contact-text">
                            Phone: +91 6359630820<br>
                            Email: financogram@gmail.com<br>
                            Location: Savvy Strata, Ahmedabad
                        </div>
                    </div>
                    
                </div>
                
                <div class="footer">
                    <div class="footer-signature">
                        Best Regards,<br>
                        The FINANCOGRAM Team
                    </div>
                </div>
            </div>
        </body>
        </html>
        """,
    )
    return Response({"success": True, "message": "OTP sent successfully"})

# Verify the OTP entered by the user
@api_view(['POST'])
def verify_otp(request):
    mobile=request.data.get('mobile')
    email = request.data.get('email')
    entered_otp = request.data.get('otp')

    if not email or not entered_otp:
        return Response({"success": False, "message": "Email and OTP are required."})

    stored_otp = cache.get(email)
    if stored_otp == entered_otp:
        
        global name1
        global username1
        global mobile1
        global email1
        global password1
        global face_image1
        global profile_image1
        global qr_code1
        
        mobile1 = mobile
        
        user = User(name=name1,username=username1, mobile=mobile1, email=email1, password=password1, face_image=face_image1, profile_image=profile_image1, qr_code=qr_code1)
        user.save()
        cache.delete(email)
        return Response({"success": True, "message": 'OTP verified successfully.\nRegistration completed successfully!'})
    else:
        return Response({"success": False, "message": "Invalid or expired OTP"})

# Check if username is available
def check_username(request):
    username = request.GET.get('username', '')
    available = not User.objects.filter(username=username).exists()
    if available:
        global username1
        username1 = username
    return JsonResponse({'available': available})

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})

# Update wallet balance
@api_view(['POST'])
def update_wallet(request):
    try:
        data = request.data
        email = data.get('email')
        amount = round(float(data.get('amount')), 2)
        
        if not email or amount is None:
            return Response({'error': 'Email and amount are required'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            user.balance = str(round(float(user.balance), 2) + amount)
            user.save()
            
            return Response({
                'status': 'success',
                'message': f'Wallet updated successfully',
                'new_balance': float(user.balance)
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=400)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_profile(request):
    try:
        data = request.data
        email = data.get('email')
        name = data.get('name')
        mobile = data.get('mobile')
        username = data.get('username')
        profile_image = data.get('profile_image')  # base64 string from frontend

        if not email:
            return Response({'error': 'Email is required'}, status=400)

        try:
            user = User.objects.get(email=email)

            # Update basic fields
            if name:
                user.name = name
            if mobile:
                user.mobile = mobile
            if username:
                user.username = username

            # Update profile image via Cloudinary
            if profile_image and ';base64,' in profile_image:
                try:
                    format, imgstr = profile_image.split(';base64,')
                    img_data = base64.b64decode(imgstr)
                    
                    # Upload to Cloudinary
                    result = cloudinary.uploader.upload(
                        img_data,
                        folder='profiles',
                        public_id=f"{email}_profile",
                        overwrite=True
                    )
                    user.profile_image = result.get('secure_url')  # URLField-safe
                except Exception as e:
                    print(f"[ERROR] Cloudinary upload failed: {str(e)}")
                    return Response({
                        'error': 'Failed to upload profile image',
                        'details': str(e)
                    }, status=500)

            user.save()

            return Response({
                'status': 'success',
                'message': 'Profile updated successfully',
                'user': {
                    'name': user.name,
                    'email': user.email,
                    'mobile': user.mobile,
                    'username': user.username,
                    'profile_image': user.profile_image,  # URLField-safe usage
                    'balance': float(user.balance)
                }
            })

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    except Exception as e:
        print(f"[ERROR] Unexpected error in update_profile: {str(e)}")
        return Response({'error': 'Internal server error', 'details': str(e)}, status=500)