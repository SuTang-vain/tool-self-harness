package snapshot
type Store struct{items []string}
func(s *Store)Add(v string){s.items=append(s.items,v)}
func(s *Store)Snapshot()[]string{return s.items}
