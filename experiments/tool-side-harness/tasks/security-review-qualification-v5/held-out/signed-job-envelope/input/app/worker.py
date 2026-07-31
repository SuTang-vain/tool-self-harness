def execute_validated(job):
    if not valid_action(job['action']): raise ValueError('unknown action')
    return worker.run(job['action'], job.get('args', {}))
