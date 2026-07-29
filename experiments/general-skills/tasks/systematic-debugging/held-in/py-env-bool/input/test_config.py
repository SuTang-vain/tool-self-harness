import unittest
from config import load

class ConfigTests(unittest.TestCase):
    def test_false_strings(self):
        for value in ['false','0','no','off']:
            self.assertFalse(load({'APP_DEBUG':value})['debug'])
    def test_true_strings(self):
        for value in ['true','1','yes','on']:
            self.assertTrue(load({'APP_DEBUG':value})['debug'])

if __name__ == '__main__': unittest.main()
