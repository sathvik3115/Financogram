import os
from deepface.basemodels import SFace

# 📂 Path to your bundled weights inside the repo
# Place `face_recognition_sface_2021dec.onnx` in: backend/api/weights/
CUSTOM_WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
CUSTOM_SFACE_PATH = os.path.join(CUSTOM_WEIGHTS_DIR, "face_recognition_sface_2021dec.onnx")

# 🔧 Monkey-patch DeepFace SFace path so it never downloads again
SFace.modelPath = CUSTOM_SFACE_PATH

# Optional cache dict if you later want manual loading
_model_cache = {}

def get_deepface_model(model_name="SFace"):
    """
    Returns the DeepFace model, loading it from local weights if not cached.
    """
    from deepface import DeepFace

    if model_name not in _model_cache:
        # This will now load from CUSTOM_SFACE_PATH instead of internet
        model = DeepFace.build_model(model_name)
        _model_cache[model_name] = model

    return _model_cache[model_name]
