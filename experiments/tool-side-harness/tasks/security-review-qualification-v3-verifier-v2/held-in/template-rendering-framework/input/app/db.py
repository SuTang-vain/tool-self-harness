def user_by_email(db, email):
    return db.execute('select * from users where email = ?', (email,)).fetchone()
