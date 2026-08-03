package configbug
import "time"
type Config struct{Timeout time.Duration}
type Client struct{Timeout time.Duration}
func NewClient(cfg Config)*Client{return newHTTPClient()}
func newHTTPClient()*Client{return &Client{Timeout:30*time.Second}}
