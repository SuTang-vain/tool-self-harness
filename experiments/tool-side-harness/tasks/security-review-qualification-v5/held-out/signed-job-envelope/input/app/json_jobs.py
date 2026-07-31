import json

def load_json_job(body):
    value = json.loads(body)
    return {'action': str(value['action']), 'args': dict(value.get('args', {}))}
