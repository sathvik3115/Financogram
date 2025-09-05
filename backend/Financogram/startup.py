# # startup.py
# import os
# from pathlib import Path
# import subprocess

# def download_vgg_weights():
#     url = "https://drive.google.com/uc?id=1h8emLTEflJB2dAsCUdVJNSOHgmEfmwS7"  # Full Google Drive URL
#     weights_dir = Path.home() / ".deepface" / "weights"
#     weights_dir.mkdir(parents=True, exist_ok=True)
#     weights_path = weights_dir / "vgg_face_weights.h5"

#     if weights_path.exists():
#         print("✅ DeepFace weights already present.")
#         return

#     print("⬇️  Downloading VGG-Face weights...")
#     try:
#         subprocess.run(
#             ["gdown", url, "-O", str(weights_path)],
#             check=True
#         )
#         print("✅ Download complete.")
#     except subprocess.CalledProcessError as e:
#         print("❌ Failed to download DeepFace weights:", e)


def preload_facenet_model():
    from deepface import DeepFace
    
    print("📦 Preloading FaceNet model...")
    DeepFace.build_model("Facenet")
    print("✅ FaceNet model preloaded.")

