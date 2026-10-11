"""Small, automatically updated projection for the courses landing page."""

FIELDS = {
    'official_hp': "json_extract({content},'$.specialty_source.official_hp')",
    'source_scope': "json_extract({content},'$.specialty_source.scope')",
    'source_pdf': "json_extract({content},'$.specialty_source.pdf')",
    'official_year': "json_extract({content},'$.specialty_source.year')",
    'encargos_count': "json_extract({content},'$.encargos.count')",
    'encargos_hours': "json_extract({content},'$.encargos.hours')",
    'ae_count': "json_array_length(json_extract({content},'$.aes'))",
}


def ensure_course_catalog(connection):
    columns = ','.join(FIELDS)
    connection.execute(f'CREATE TABLE IF NOT EXISTS course_catalog (module_id INTEGER PRIMARY KEY REFERENCES modules(id) ON DELETE CASCADE,{columns})')
    projection = ','.join(expr.format(content='m.content') for expr in FIELDS.values())
    connection.execute(f'''INSERT INTO course_catalog(module_id,{columns})
        SELECT m.id,{projection} FROM modules m
        WHERE NOT EXISTS (SELECT 1 FROM course_catalog c WHERE c.module_id=m.id)''')
    projection = ','.join(expr.format(content='NEW.content') for expr in FIELDS.values())
    for name, event in [('insert', 'INSERT'), ('update', 'UPDATE OF content')]:
        condition = 'WHEN OLD.content IS NOT NEW.content' if name == 'update' else ''
        connection.execute(f'''CREATE TRIGGER IF NOT EXISTS course_catalog_{name}
            AFTER {event} ON modules {condition}
            BEGIN
                INSERT OR REPLACE INTO course_catalog(module_id,{columns}) VALUES(NEW.id,{projection});
            END''')
    connection.execute('''CREATE TRIGGER IF NOT EXISTS course_catalog_delete AFTER DELETE ON modules
        BEGIN DELETE FROM course_catalog WHERE module_id=OLD.id; END''')
