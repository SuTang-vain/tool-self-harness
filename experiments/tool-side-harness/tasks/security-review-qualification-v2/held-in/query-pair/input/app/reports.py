def recent_report(request, db):
    owner = request.args.get('owner', '')
    return db.execute('SELECT * FROM reports WHERE owner = ?', (owner,)).fetchall()
