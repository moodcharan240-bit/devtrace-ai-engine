import os
import zipfile

OUTPUT_ZIP = "DevTrace-AI.zip"
EXCLUDE_DIRS = {"node_modules", "dist", ".git", ".next", ".cache"}
EXCLUDE_EXTS = {".zip"}

def create_archive():
    print(f"Creating {OUTPUT_ZIP} (excluding {EXCLUDE_DIRS})...")
    with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk("."):
            # Filter out excluded dirs in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
                    continue
                file_path = os.path.join(root, file)
                # Store relative path
                arcname = os.path.relpath(file_path, ".")
                zf.write(file_path, arcname)
    
    size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
    print(f"Successfully generated {OUTPUT_ZIP} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    create_archive()
