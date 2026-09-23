from pathlib import Path
import re
for p in [
    Path("/opt/aulatp/course_portal/index.html"),
    Path("/opt/aulatp/frontends/electricity/index.html"),
    Path("/opt/aulatp/frontends/enfermeria/index.html"),
    Path("/opt/aulatp/frontends/catalog/index.html"),
]:
    t = p.read_text()
    n = re.sub(
        r"lms-module-route-colors\.css\?v=[^\"]+",
        "lms-module-route-colors.css?v=20260914-modulos-vivid-v5",
        t,
    )
    if n != t:
        p.write_text(n)
        print("bumped", p)
    else:
        print("no change", p)
