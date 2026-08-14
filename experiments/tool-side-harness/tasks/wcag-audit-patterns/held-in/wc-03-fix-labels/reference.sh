#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/page.html <<'YEOF'
<html lang="en">
<head><title>Form</title></head>
<body>
<h1>Sign up</h1>
<form>
  <label for="name">Name</label>
  <input type="text" name="name" id="name">
  <button type="button" onclick="submitForm()">Submit</button>
</form>
</body>
</html>
YEOF
