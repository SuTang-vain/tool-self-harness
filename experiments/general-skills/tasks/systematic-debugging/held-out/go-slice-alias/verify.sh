#!/usr/bin/env bash
set -euo pipefail
cd "$1";go test ./...
cat > hidden_test.go <<'GO'
package snapshot
import"testing"
func TestCallerCannotMutateStore(t *testing.T){var s Store;s.Add("a");x:=s.Snapshot();x[0]="changed";if s.Snapshot()[0]!="a"{t.Fatal("aliased")}}
GO
go test ./...
echo 'PASS go-slice-alias'
