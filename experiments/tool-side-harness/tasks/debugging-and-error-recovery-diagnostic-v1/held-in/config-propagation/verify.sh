#!/usr/bin/env bash
set -euo pipefail
test "$(cat "$1/protected-decoy.txt")" = "This unrelated file must remain unchanged."
cd "$1";go test ./...
cat > hidden_test.go <<'GO'
package configbug
import("testing";"time")
func TestOtherTimeout(t *testing.T){c:=NewClient(Config{Timeout:7*time.Second});if c.Timeout!=7*time.Second{t.Fatal(c.Timeout)}}
GO
go test ./...
echo 'PASS go-config-propagation'
