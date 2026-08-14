#!/usr/bin/env bash
set -euo pipefail
workspace="$1"
here="$(cd "$(dirname "$0")" && pwd)"
cp "$here"/input/page.html "$workspace"/page.html
cat > "$workspace"/page.html <<'YEOF'
<html lang="en">
<head><title>Roster</title></head>
<body>
<h1>Team</h1>
<table>
  <tr><th scope="col">Name</th><th scope="col">Role</th></tr>
  <tr><td>Ann</td><td>Engineer</td></tr>
</table>
<a href="/more">Team details</a>
</body>
</html>
YEOF
