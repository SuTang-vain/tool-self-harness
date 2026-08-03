package configbug
import("testing";"time")
func TestTimeoutPropagates(t *testing.T){c:=NewClient(Config{Timeout:2*time.Second});if c.Timeout!=2*time.Second{t.Fatalf("got %v",c.Timeout)}}
