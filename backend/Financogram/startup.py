# startup.py
import os
from pathlib import Path
import subprocess

def download_vgg_weights():
    file_id = "1h8emLTEflJB2dAsCUdVJNSOHgmEfmwS7"  # Your actual file ID
    weights_dir = Path.home() / ".deepface" / "weights"
    weights_dir.mkdir(parents=True, exist_ok=True)
    weights_path = weights_dir / "vgg_face_weights.h5"

    if weights_path.exists():
        print("✅ DeepFace weights already present.")
        return

    print("⬇️  Downloading VGG-Face weights...")
    try:
        subprocess.run(
            ["gdown", "--id", file_id, "-O", str(weights_path)],
            check=True
        )
        print("✅ Download complete.")
    except subprocess.CalledProcessError as e:
        print("❌ Failed to download DeepFace weights:", e)
