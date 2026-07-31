from flask import request, render_template

def profile():
    return render_template('profile.html', bio=request.form.get('bio', ''))
