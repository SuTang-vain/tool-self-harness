import unittest,time,threading
from waiter import wait_until
class T(unittest.TestCase):
 def test_returns_early(self):
  state={'ok':False};threading.Timer(.03,lambda:state.update(ok=True)).start();start=time.monotonic();self.assertTrue(wait_until(lambda:state['ok'],.5,.01));self.assertLess(time.monotonic()-start,.2)
if __name__=='__main__':unittest.main()
