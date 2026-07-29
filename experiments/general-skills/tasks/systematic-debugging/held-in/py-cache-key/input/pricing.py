_CACHE = {}

def total_with_tax(subtotal, tax_rate):
    key = round(float(subtotal), 2)
    if key not in _CACHE:
        _CACHE[key] = round(float(subtotal) * (1 + float(tax_rate)), 2)
    return _CACHE[key]

def clear_cache():
    _CACHE.clear()
