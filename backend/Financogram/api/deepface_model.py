import os
from .deepface.basemodels.SFace import SFaceClient
from .deepface.basemodels.VGGFace import VggFaceClient

# Optional cache dict for reuse
_model_cache = {}

def get_deepface_model(model_name="SFace"):
    if model_name not in _model_cache:
        if model_name == "SFace":
            _model_cache[model_name] = SFaceClient()
        elif model_name == "VGG-Face":
            _model_cache[model_name] = VggFaceClient()
        else:
            raise ValueError(f"Unsupported model: {model_name}")
    return _model_cache[model_name]
