"""Local city preview; optionally use a separate local campus backend."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.error import HTTPError
import mimetypes
import re
import argparse

ROOT=Path(__file__).resolve().parent
PREFIX='/ciudad_laboral_aulatp/'
STYLE=PREFIX+'panel-ui-v1/city-panel.css'
API_ORIGIN=None


class Handler(BaseHTTPRequestHandler):
    def local_backend(self):
        headers={'Host':self.headers.get('Host','127.0.0.1')}
        for key in ('Cookie','Content-Type','X-CSRF-Token','Origin','Referer'):
            if self.headers.get(key):headers[key]=self.headers[key]
        length=int(self.headers.get('Content-Length','0'))
        if length>2*1024*1024:self.send_error(413);return
        body=self.rfile.read(length) if length else None
        request=Request(API_ORIGIN+self.path,data=body,headers=headers,method=self.command)
        try:
            incoming=urlopen(request,timeout=60)
        except HTTPError as error:incoming=error
        with incoming:
            data=incoming.read();self.send_response(incoming.status)
            for key in ('Content-Type','Set-Cookie','Location','Cache-Control'):
                for value in incoming.headers.get_all(key,[]):self.send_header(key,value)
            self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)

    def do_POST(self):
        if API_ORIGIN and self.path.startswith('/api/'):self.local_backend()
        else:self.send_error(405)

    def do_GET(self):
        if API_ORIGIN and not self.path.startswith(PREFIX):
            self.local_backend();return
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
                    data=re.sub(rb'/ciudad_laboral_aulatp/panel-ui-v[0-9]+/',(PREFIX+'panel-ui-v1/').encode(),data)
                    if STYLE.encode() not in data:
                        data=data.replace(b'</head>',f'<link rel="stylesheet" href="{STYLE}"></head>'.encode())
                    if (PREFIX+'panel-ui-v1/city-panel.js').encode() not in data:
                        data=data.replace(b'</body>',f'<script defer src="{PREFIX}panel-ui-v1/city-panel.js"></script></body>'.encode())
                    native=f'<script defer src="{PREFIX}panel-ui-v1/native-route.js"></script>'.encode()
                    workshop=f'<script defer src="{PREFIX}panel-ui-v1/native-workshop.js"></script>'.encode()
                    if workshop not in data:
                        data=data.replace(native,workshop+native) if native in data else data.replace(b'</body>',workshop+native+b'</body>')
                self.send_response(incoming.status)
                for key in ('Content-Type','Content-Range','Accept-Ranges'):
                    if incoming.headers.get(key):self.send_header(key,incoming.headers[key])
                self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
        except HTTPError as error:self.send_error(error.code)
        except (BrokenPipeError,ConnectionResetError):pass


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=8108)
    parser.add_argument('--api-origin',choices=['http://127.0.0.1:8110'])
    args=parser.parse_args();API_ORIGIN=args.api_origin
    print(f'Preview: http://127.0.0.1:{args.port}/ciudad_laboral_aulatp/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
