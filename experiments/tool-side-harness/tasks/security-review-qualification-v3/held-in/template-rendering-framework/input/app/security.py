import bleach

def sanitized_html(value):
    return bleach.clean(value, tags=['b','i','p'], attributes={}, strip=True)
