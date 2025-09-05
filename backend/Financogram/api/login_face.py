import base64
import cv2
import numpy as np
from deepface import DeepFace


def decode_base64_image(data_url):
    header, encoded = data_url.split(',', 1)
    img_bytes = base64.b64decode(encoded)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def verify_face(img1, img2_path):
    try:
        result = DeepFace.verify(img1_path=img1, img2_path=img2_path, enforce_detection=True)
        return result["verified"]
    except Exception as e:
        print("DeepFace error:", e)
        return False
