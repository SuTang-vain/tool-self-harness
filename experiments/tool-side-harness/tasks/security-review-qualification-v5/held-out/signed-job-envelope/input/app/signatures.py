import hashlib
import hmac
import os
KEY = os.environ['JOB_SIGNING_KEY'].encode()

def verify_signature(payload, supplied):
    expected = hmac.new(KEY, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, supplied)
