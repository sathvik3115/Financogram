import base64
import cv2
import numpy as np
from .deepface_model import get_deepface_model
from .vendor.deepface import DeepFace

# ⚡ Preload once (ensures it’s cached and uses local weights)
model = get_deepface_model("SFace")

def decode_base64_image(data_url):
    """
    Decode base64 image from frontend into OpenCV (NumPy) format.
    """
    header, encoded = data_url.split(',', 1)
    img_bytes = base64.b64decode(encoded)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def verify_face(img1, img2_path):
    try:
        result = DeepFace.verify(
            img1_path=img1,
            img2_path=img2_path,
            model_name="SFace",
            enforce_detection=False
        )
        return result.get("verified", False)
    except Exception as e:
        print("DeepFace verify error:", e)
        return False