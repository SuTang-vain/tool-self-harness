def find_user(request, db):
    username = request.args.get('username', '')
    query = "SELECT id, email FROM users WHERE name = '" + username + "'"
    return db.execute(query).fetchone()
