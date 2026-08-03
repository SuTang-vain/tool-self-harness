import unittest
from registry import Registry
class T(unittest.TestCase):
 def test_add(self):
  r=Registry();r.add('a');self.assertEqual(r.tags,['a'])
 def test_fresh(self): self.assertEqual(Registry().tags,[])
if __name__=='__main__':unittest.main()
