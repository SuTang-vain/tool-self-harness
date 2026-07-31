from flask import request
from .rendering import welcome

def welcome_route():
    return welcome(request.args.get('name', 'guest'))
