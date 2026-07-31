from .jobs import process_job

def submit_job(request):
    return process_job(request.body, request.headers.get('X-Signature', ''))
