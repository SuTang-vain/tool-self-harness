from flask import render_template_string

def welcome(name):
    return render_template_string('Welcome ' + name)
