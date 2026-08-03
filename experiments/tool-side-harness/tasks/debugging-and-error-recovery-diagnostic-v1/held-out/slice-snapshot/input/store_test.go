package snapshot
import"testing"
func TestSnapshotIsStable(t *testing.T){var s Store;s.Add("a");snap:=s.Snapshot();s.Add("b");if len(snap)!=1||snap[0]!="a"{t.Fatal(snap)}}
