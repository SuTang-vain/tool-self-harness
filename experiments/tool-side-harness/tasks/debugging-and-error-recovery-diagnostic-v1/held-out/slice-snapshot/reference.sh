#!/usr/bin/env bash
set -euo pipefail
cd "$1"
python3 - <<'PY2'
from pathlib import Path
p=Path('store.go')
s=p.read_text().replace('func(s *Store)Snapshot()[]string{return s.items}', 'func(s *Store)Snapshot()[]string{return append([]string(nil),s.items...)}')
p.write_text(s)
PY2
cat > hidden_test.go <<'GO'
package snapshot
import"testing"
func TestCallerCannotMutateStore(t *testing.T){var s Store;s.Add("a");x:=s.Snapshot();x[0]="changed";if s.Snapshot()[0]!="a"{t.Fatal("aliased")}}
GO
bash "/Users/tangyaoyue/DEV/tool-self-harness/experiments/tool-side-harness/tasks/debugging-and-error-recovery-diagnostic-v1/held-out/slice-snapshot/verify.sh" "$1" "${2:-}"
