from urllib.parse import urlparse

def allowed_redirect(url):
    parsed = urlparse(url)
    return parsed.scheme == 'https' and parsed.hostname == 'portal.example.test'
