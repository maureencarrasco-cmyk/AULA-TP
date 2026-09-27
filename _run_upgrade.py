import traceback

from catalog import upgrade_catalog
import sqlite3

con = sqlite3.connect(r"data/aulatp.sqlite3")
con.row_factory = sqlite3.Row
con.execute("PRAGMA foreign_keys=ON")
try:
    upgrade_catalog(con)
    con.commit()
    print("OK upgrade")
except Exception:
    con.rollback()
    traceback.print_exc()
    raise
courses = list(con.execute("SELECT id,title FROM courses ORDER BY id"))
print("COURSES", len(courses))
full = 0
for c in courses:
    tot = con.execute("SELECT COUNT(*) n FROM modules WHERE course_id=?", (c["id"],)).fetchone()["n"]
    pub = con.execute("SELECT COUNT(*) n FROM modules WHERE course_id=? AND published=1", (c["id"],)).fetchone()["n"]
    if tot and pub == tot:
        full += 1
        mark = "FULL"
    elif pub:
        mark = "PART"
    else:
        mark = "DRAFT"
    print(f"{c['id']:3} {mark:5} {pub:2}/{tot:2}  {c['title']}")
print("FULL", full)
