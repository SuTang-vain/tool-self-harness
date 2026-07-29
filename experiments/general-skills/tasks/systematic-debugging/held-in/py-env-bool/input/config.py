def env_bool(value, default=False):
    if value is None:
        return default
    return bool(value)

def load(env):
    return {'debug': env_bool(env.get('APP_DEBUG'), False)}
