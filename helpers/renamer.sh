#!/bin/bash
# rename_web.sh

for file in *; do
    [[ -f "$file" ]] || continue
    
    # Conversion web-safe
    new=$(echo "$file" | \
        iconv -f utf8 -t ascii//TRANSLIT | \
        tr '[:upper:]' '[:lower:]' | \
        sed 's/[^a-z0-9._-]/_/g' | \
        sed 's/__*/_/g' | \
        sed 's/^_\|_$//g')
    
    [[ "$file" != "$new" ]] && mv "$file" "$new"
done