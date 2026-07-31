def safe_log(job): return {'action': job.get('action'), 'arg_count': len(job.get('args', {}))}
