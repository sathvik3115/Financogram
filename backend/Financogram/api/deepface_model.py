import os
from .vendor.deepface.basemodels.SFace import SFaceClient

# Optional cache dict for reuse
_model_cache = {}

def get_deepface_model(model_name="SFace"):
    """
    Returns the local DeepFace model without downloading.
    Supports SFace only (custom ONNX model).
    """

    if model_name != "SFace":
        raise ValueError(f"Only 'SFace' is supported in local setup, got '{model_name}'")

    if model_name not in _model_cache:
        model = SFaceClient()
        _model_cache[model_name] = model

    return _model_cache[model_name]
