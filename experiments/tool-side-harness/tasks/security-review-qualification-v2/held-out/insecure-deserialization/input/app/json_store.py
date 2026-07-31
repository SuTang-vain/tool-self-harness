import json

def load_preferences(request):
    return json.loads(request.body)
