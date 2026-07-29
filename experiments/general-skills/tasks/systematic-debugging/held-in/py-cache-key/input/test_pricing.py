import unittest
import pricing

class PricingTests(unittest.TestCase):
    def setUp(self): pricing.clear_cache()
    def test_same_subtotal_different_tax_rates(self):
        self.assertEqual(pricing.total_with_tax(100, 0.05), 105.0)
        self.assertEqual(pricing.total_with_tax(100, 0.20), 120.0)
    def test_repeated_call(self):
        self.assertEqual(pricing.total_with_tax(50, 0.1), 55.0)
        self.assertEqual(pricing.total_with_tax(50, 0.1), 55.0)

if __name__ == '__main__': unittest.main()
