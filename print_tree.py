import os

ignore = {
    'node_modules', '.venv', 'venv', 'env', '.git', 
    '__pycache__', 'dist', 'build', '.idea', '.vscode', 'coverage'
}

def print_tree(startpath):
    for root, dirs, files in os.walk(startpath):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in ignore]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            if f not in ignore and not f.endswith('.pyc'):
                print(f"{subindent}{f}")

if __name__ == "__main__":
    print_tree('.')