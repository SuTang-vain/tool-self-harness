def save_result(db, job_id, result):
    return db.execute('insert into results(id, value) values (?, ?)', (job_id, result))
