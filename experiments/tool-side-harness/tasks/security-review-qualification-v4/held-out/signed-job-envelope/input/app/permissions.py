def run_privileged(job):
    return admin_queue.submit(job['action'], job.get('args', {}))
