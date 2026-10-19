"""Local preview of a CSS-only city skin against the unchanged public application."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import mimetypes
import re

ROOT=Path(__file__).resolve().parent
PREFIX='/ciudad_laboral_aulatp/'
STYLE=PREFIX+'panel-ui-v1/city-panel.css'


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith(PREFIX+'panel-ui-v1/'):
            relative=self.path.split('?',1)[0].removeprefix(PREFIX+'panel-ui-v1/')
            path=(ROOT/relative).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():
                self.send_error(404);return
            data=path.read_bytes();self.send_response(200)
            self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream')
            self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
        if not self.path.startswith(PREFIX):
            self.send_error(404);return
        try:
            headers={'User-Agent':'AulaTP-Frontend-Preview'}
            if self.headers.get('Range'):headers['Range']=self.headers['Range']
            with urlopen(Request('https://www.aulatpchile.cl'+self.path,headers=headers),timeout=90) as incoming:
                data=incoming.read();kind=incoming.headers.get('Content-Type','application/octet-stream')
                if 'text/html' in kind:
                    data=re.sub(rb'/ciudad_laboral_aulatp/panel-ui-v[0-9]+/(city-panel\.(?:css|js))',
                                lambda match:(PREFIX+'panel-ui-v1/').encode()+match[1],data)
                    if STYLE.encode() not in data:
                        data=data.replace(b'</head>',f'<link rel="stylesheet" href="{STYLE}"></head>'.encode())
                    if (PREFIX+'panel-ui-v1/city-panel.js').encode() not in data:
                        data=data.replace(b'</body>',f'<script defer src="{PREFIX}panel-ui-v1/city-panel.js"></script></body>'.encode())
                self.send_response(incoming.status)
                for key in ('Content-Type','Content-Range','Accept-Ranges'):
                    if incoming.headers.get(key):self.send_header(key,incoming.headers[key])
                self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
        except HTTPError as error:self.send_error(error.code)
        except (BrokenPipeError,ConnectionResetError):pass


if __name__=='__main__':
    print('Preview: http://127.0.0.1:8108/ciudad_laboral_aulatp/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8108),Handler).serve_forever()
