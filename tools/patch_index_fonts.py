from pathlib import Path
import re

new_fonts = "family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@600;700;800"
files = [
    Path("/opt/aulatp/course_portal/index.html"),
    Path("/opt/aulatp/frontends/electricity/index.html"),
    Path("/opt/aulatp/frontends/enfermeria/index.html"),
    Path("/opt/aulatp/frontends/catalog/index.html"),
]
for p in files:
    t = p.read_text()
    t = t.replace(
        "family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=Manrope:wght@600;700;800",
        new_fonts,
    )
    if "family=Outfit" not in t and "fonts.googleapis.com" in t:
        t = re.sub(
            r'href="https://fonts.googleapis.com/css2\?[^"]+"',
            'href="https://fonts.googleapis.com/css2?' + new_fonts + '&display=swap"',
            t,
            count=1,
        )
    t = re.sub(
        r"lms-module-route-colors\.css\?v=[^\"]+",
        "lms-module-route-colors.css?v=20260914-modulos-vivid-v4",
        t,
    )
    p.write_text(t)
    print(p.name, "outfit" if "Outfit" in t else "NO_OUTFIT", "v4" if "vivid-v4" in t else "NO_V4")
