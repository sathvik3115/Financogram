from deepface import DeepFace

_model_cache = {}

def get_deepface_model(model_name="SFace"):
    if model_name not in _model_cache:
        _model_cache[model_name] = DeepFace.build_model(model_name)
    return _model_cache[model_name]