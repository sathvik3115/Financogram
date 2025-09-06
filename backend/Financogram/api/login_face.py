import base64
import cv2
import numpy as np
# import face_recognition
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from deepface import DeepFace

models = DeepFace.build_model("SFace")

def decode_base64_image(data_url):
    header, encoded = data_url.split(',', 1)
    img_bytes = base64.b64decode(encoded)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

# Module: DeepFace
def verify_face(img1, img2_path):
        
    try:
        result = DeepFace.verify(img1_path=img1, img2_path=img2_path, model_name="SFace", enforce_detection=False)
        return result["verified"]
    except Exception as e:
        print("DeepFace error:", e)
        return False

# Module: face_recognition
# def verify_face(img1, img2_path):
#     try:
#         # Convert webcam image from BGR (OpenCV) to RGB (face_recognition)
#         img1_rgb = cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)

#         # Load stored face image from file
#         img2 = face_recognition.load_image_file(img2_path)

#         # Get face encodings for both images
#         encodings1 = face_recognition.face_encodings(img1_rgb)
#         encodings2 = face_recognition.face_encodings(img2)

#         if len(encodings1) == 0:
#             print("No face found in the live image")
#             return False
#         if len(encodings2) == 0:
#             print("No face found in the stored image")
#             return False

#         # Take the first face encoding from both images
#         encoding1 = encodings1[0]
#         encoding2 = encodings2[0]

#         # Compare the faces
#         results = face_recognition.compare_faces([encoding2], encoding1)

#         return results[0]

#     except Exception as e:
#         print("Face recognition error:", e)
#         return False