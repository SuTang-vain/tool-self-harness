import unittest
from parser import parse_records
class T(unittest.TestCase):
 def test_blank_line(self):self.assertEqual(parse_records('a:1\n\nb:2'),[('a','1'),('b','2')])
if __name__=='__main__':unittest.main()
