#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/page.html <<'YEOF'
<html lang="en">
<head><title>Search</title></head>
<body>
<h1>Search</h1>
<form>
  <label for="q">Query</label>
  <input type="text" name="q" id="q">
</form>
<button type="button" onclick="go()">Go</button>
</body>
</html>
YEOF
