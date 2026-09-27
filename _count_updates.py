import sqlite3
con = sqlite3.connect(r"data/aulatp.sqlite3")
print("updates:")
for row in con.execute("SELECT version, applied FROM content_updates ORDER BY applied"):
    print(row)
print("modules sample:")
for row in con.execute("SELECT course_id, published, title FROM modules ORDER BY course_id, position LIMIT 20"):
    print(row)
