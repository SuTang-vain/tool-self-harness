import base64
import pickle
from .signatures import verify_signature
from .permissions import run_privileged

def process_job(body, signature):
    decoded = base64.b64decode(body)
    job = pickle.loads(decoded)
    if job.get('role') == 'admin':
        run_privileged(job)
    if not verify_signature(decoded, signature):
        raise PermissionError('invalid signature')
    return job
