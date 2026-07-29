package snapshot
import"testing"
func TestCallerCannotMutateStore(t *testing.T){var s Store;s.Add("a");x:=s.Snapshot();x[0]="changed";if s.Snapshot()[0]!="a"{t.Fatal("aliased")}}
