#!/bin/bash

# Script to fix UI component imports in feature folders
# This updates './ui/' to the correct relative path to shared/components/ui

# Function to update imports in a file
update_imports() {
    local file=$1
    local depth=$2  # Number of ../ needed to reach src
    
    # Calculate path to shared/components/ui
    local path_to_ui=""
    for ((i=0; i<depth; i++)); do
        path_to_ui="../$path_to_ui"
    done
    path_to_ui="${path_to_ui}shared/components/ui"
    
    # Replace './ui/' with calculated path
    sed -i '' "s|from './ui/|from '${path_to_ui}/|g" "$file"
    sed -i '' "s|from \"./ui/|from \"${path_to_ui}/|g" "$file"
}

# Update files in features/*/components (3 levels deep from src)
find src/features -path "*/components/*.tsx" -type f | while read file; do
    update_imports "$file" 3
done

# Update files in features/*/components/student (4 levels deep from src)
find src/features -path "*/components/student/*.tsx" -type f | while read file; do
    update_imports "$file" 4
done

echo "Import fixes completed!"

