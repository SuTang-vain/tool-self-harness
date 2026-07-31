import base64
import pickle

def load_job(request):
    payload = base64.b64decode(request.body)
    return pickle.loads(payload)
