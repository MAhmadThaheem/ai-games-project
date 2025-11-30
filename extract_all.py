import os

output_file = "full_project_code.txt"

# Extensions to include (Frontend + Backend)
valid_extensions = ['.py', '.tsx', '.ts', '.js', '.css', '.html', '.json']

# Exact filenames to include (Config files)
include_filenames = ['requirements.txt', 'package.json', '.env', 'Dockerfile']

# Folders to IGNORE (Bohat zaroori hai taake junk files na ayen)
ignore_dirs = [
    'node_modules', '.venv', 'venv', 'env', '.git', 
    '__pycache__', 'dist', 'build', '.idea', '.vscode', 'coverage'
]

# Files to IGNORE (Jo bohat lambi aur useless hain)
ignore_files = ['package-lock.json', 'yarn.lock', 'full_project_code.txt']

def extract_all_code():
    count = 0
    with open(output_file, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk("."):
            
            # Remove ignored directories from traversal
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            for file in files:
                # Filter Logic
                ext = os.path.splitext(file)[1].lower()
                is_valid_ext = ext in valid_extensions
                is_include_file = file in include_filenames
                is_ignored = file in ignore_files

                if (is_valid_ext or is_include_file) and not is_ignored:
                    file_path = os.path.join(root, file)
                    
                    # Skip files larger than 1MB (likely images or bundled libs)
                    if os.path.getsize(file_path) > 1024 * 1024: 
                        print(f"Skipping large file: {file_path}")
                        continue

                    print(f"Adding: {file_path}")
                    count += 1

                    try:
                        with open(file_path, "r", encoding="utf-8", errors='ignore') as infile:
                            content = infile.read()
                            
                            # Write Header
                            outfile.write("\n" + "=" * 60 + "\n")
                            outfile.write(f"FILE: {file_path}\n")
                            outfile.write("=" * 60 + "\n")
                            
                            # Write Content
                            outfile.write(content + "\n")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

    print(f"\nDone! {count} files saved to: {output_file}")

if __name__ == "__main__":
    extract_all_code()