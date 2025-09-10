import os
from typing import Any, List

import numpy as np
import cv2 as cv

from ..commons import functions
from ..models.FacialRecognition import FacialRecognition


# pylint: disable=line-too-long, too-few-public-methods

class SFaceClient(FacialRecognition):
    """
    SFace model class
    """

    def __init__(self):
        self.model = load_model()
        self.model_name = "SFace"

    def find_embeddings(self, img: np.ndarray) -> List[float]:
        """
        find embeddings with SFace model - different than regular models
        Args:
            img (np.ndarray): pre-loaded image in BGR
        Returns
            embeddings (list): multi-dimensional vector
        """
        # revert the image to original format and preprocess using the model
        input_blob = (img[0] * 255).astype(np.uint8)

        embeddings = self.model.model.feature(input_blob)

        return embeddings[0].tolist()


def load_model(
    local_path="api/weights/face_recognition_sface_2021dec.onnx",
) -> Any:
    """
    Construct SFace model from a local .onnx file
    """

    abs_path = os.path.abspath(local_path)

    if not os.path.isfile(abs_path):
        raise FileNotFoundError(f"[SFace] ONNX model not found at {abs_path}")

    print(f"[SFace] Loading ONNX model from: {abs_path}")
    model = SFaceWrapper(model_path=abs_path)

    return model


class SFaceWrapper:
    def __init__(self, model_path):
        """
        SFace wrapper covering model construction, layer infos and predict
        """
        try:
            self.model = cv.FaceRecognizerSF.create(
                model=model_path, config="", backend_id=0, target_id=0
            )
        except Exception as err:
            raise ValueError(
                "Exception while calling opencv.FaceRecognizerSF module. "
                "This is an optional dependency. "
                "You can install it with: pip install opencv-contrib-python"
            ) from err

        self.layers = [_Layer()]


class _Layer:
    input_shape = (None, 112, 112, 3)
    output_shape = (None, 1, 128)
