#!/bin/bash
# Replace useAuth with demo user in all pages

for file in client/src/pages/*.tsx; do
  if grep -q "const { user } = useAuth();" "$file"; then
    sed -i 's/const { user } = useAuth();/\/\/ Bypass authentication\n  const user = { name: "Utilizador", id: "demo-user" };/g' "$file"
    echo "Fixed: $file"
  fi
done

echo "All pages fixed!"
