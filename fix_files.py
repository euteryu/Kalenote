import os

def fix_filenames():
    # Get the current directory (Kalenote)
    root_path = os.getcwd()
    print(f"Scanning directory: {root_path}...\n")

    files_renamed = 0

    # Walk through all directories and subdirectories
    for dirpath, dirs, files in os.walk(root_path):
        for filename in files:
            original_path = os.path.join(dirpath, filename)
            new_name = None

            # --- 1. Handle Specific Edge Cases & Missing Extensions ---
            
            # Fix double extension typo
            if filename == "store.ts.ts":
                new_name = "store.ts"
            
            # Fix messed up middle extension
            elif filename == "background.tsx.2.txt":
                new_name = "background.tsx"
            
            # Fix Tauri config (needs .json)
            elif filename == "tauri.conf2.txt":
                new_name = "tauri.conf.json"
                
            # Fix Vite config (needs .ts since this is a TypeScript project)
            elif filename == "vite.config2.txt":
                new_name = "vite.config.ts"
            
            # Fix PostCSS config (usually .js or .cjs)
            elif filename == "postcss.config2.txt":
                new_name = "postcss.config.js"

            # --- 2. Handle General Pattern (removing "2.txt") ---
            elif filename.endswith("2.txt"):
                # Example: package.json2.txt -> package.json
                new_name = filename.replace("2.txt", "")

            # --- Apply Rename ---
            if new_name:
                new_path = os.path.join(dirpath, new_name)
                
                # Check if the target file already exists to prevent overwriting
                if os.path.exists(new_path):
                    print(f"[SKIP] Cannot rename '{filename}' -> '{new_name}' (Target exists)")
                else:
                    try:
                        os.rename(original_path, new_path)
                        print(f"[OK] Renamed: {filename} -> {new_name}")
                        files_renamed += 1
                    except Exception as e:
                        print(f"[ERROR] Could not rename {filename}: {e}")

    print(f"\nCompleted! Total files renamed: {files_renamed}")

if __name__ == "__main__":
    fix_filenames()