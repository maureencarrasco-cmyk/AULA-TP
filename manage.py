"""Utilidades locales de administración; no realizan conexiones externas."""
import argparse, getpass, os, sqlite3
from datetime import datetime
from pathlib import Path
from werkzeug.security import generate_password_hash
ROOT=Path(__file__).resolve().parent
p=argparse.ArgumentParser(description='Administración local de Aula TP Chile');p.add_argument('command',choices=['backup','password']);p.add_argument('--user');args=p.parse_args()
data=Path(os.environ.get('AULATP_DATA',str(ROOT/'data')));db=data/'aulatp.sqlite3'
if not db.exists():raise SystemExit('Inicia el campus una vez para crear la base de datos.')
if args.command=='backup':
 folder=ROOT/'backups';folder.mkdir(exist_ok=True)
 target=folder/('aulatp-'+datetime.now().strftime('%Y%m%d-%H%M%S-%f')+'.sqlite3')
 with sqlite3.connect(db) as source,sqlite3.connect(target) as dest:source.backup(dest)
 target.chmod(0o600);print('Respaldo creado:',target)
else:
 if not args.user:raise SystemExit('Indica --user seguido del nombre de usuario.')
 with sqlite3.connect(db) as con:
  if not con.execute('SELECT 1 FROM users WHERE username=?',(args.user,)).fetchone():raise SystemExit('Usuario inexistente.')
  first=getpass.getpass('Nueva contraseña (10 a 128 caracteres): ');second=getpass.getpass('Repite la contraseña: ')
  if first!=second or not 10<=len(first)<=128:raise SystemExit('Las contraseñas no coinciden o su longitud no es válida.')
  con.execute('UPDATE users SET password=? WHERE username=?',(generate_password_hash(first),args.user))
 print('Contraseña actualizada.')
