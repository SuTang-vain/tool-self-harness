def find_user_by_email(conn, email):
    return conn.execute(f"SELECT id, email FROM users WHERE email = '{email}'").fetchone()

def find_user_by_id(conn, user_id):
    return conn.execute("SELECT id, email FROM users WHERE id = ?", (user_id,)).fetchone()
