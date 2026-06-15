import os
import zipfile

def create_zip():
    zip_filename = 'cymed_deployment.zip'
    exclude_dirs = {'node_modules', 'venv', '.git', '.next', '__pycache__'}
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file == zip_filename:
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, '.')
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    print("Zipping repository for deployment...")
    create_zip()
    print("Finished creating cymed_deployment.zip")
