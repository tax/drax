import time
import json
import os
import sys
from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.websocket import WebSocketHandler


class MainHandler(RequestHandler):
    assets = {
        'app/main.js': {
            'folder': '/assets/js',
            'mimetype': 'application/x-javascript',
            'extension': 'js'
        },
        'app/main.css': {
            'folder': '/widgets',
            'mimetype': 'text/css',
            'extension': 'css'
        },
        'app/widgets.jsx': {
            'folder': '/widgets',
            'mimetype': 'application/x-javascript',
            'extension': 'jsx',
        },
    }

    def initialize(self, path):
        self.path = path
        self.dashboards = []
        for f in sorted(os.listdir(path + '/dashboards')):
            if f.endswith('.html'):
                self.dashboards.append(f.strip('.html'))

    def serve_assets(self, filename):
        if filename not in self.assets.keys():
            return self.send_error(404)

        asset = self.assets[filename]
        self.set_header('Content-Type', asset['mimetype'])
        for root, dirs, files in os.walk(self.path + asset['folder']):
            ext = asset['extension']
            for f in [f for f in sorted(files) if f.endswith(ext)]:
                fd = open(root + '/' + f)
                self.write('\n/* {0} file: {1} */\n'.format(ext, f))
                self.write(fd.read())

    def get(self, filename):
        if filename == '':
            self.redirect('/' + self.dashboards[0])
        
        if filename.startswith('app/'):
            return self.serve_assets(filename)

        if filename not in self.dashboards:
            return self.send_error(404)
        self.render(filename + '.html')


class PublishHandler(RequestHandler):
    def initialize(self, clients, messages, auth_token):
        self.clients = clients
        self.messages = messages
        self.auth_token = auth_token

    def post(self, target):
        data = json.loads(self.request.body)
        if self.auth_token and data.get('auth_token', '') != self.auth_token:
            return self.send_error(status_code=401)
        event = 'widget'
        if self.request.path.startswith('/dashboards'):
            event = 'dashboard'

        data.pop('auth_token', None)
        data['id'] = target
        data['updatedAt'] = time.time()
        msg = json.dumps({'data': data, 'event': event})
        for client in self.clients:
            client.write_message(msg)

        if event == 'widget':
            self.messages[target] = msg
        self.set_status(204)


class EventHandler(WebSocketHandler):
    def open(self, *args):
        # Send current state of widgets on connect
        for msg in messages.values():
            self.write_message(msg)
        clients.append(self)

    def on_close(self):
        clients.remove(self)


clients = []
messages = {}


def make_app(path, auth_token):
    args = dict(clients=clients, messages=messages, auth_token=auth_token)
    urls = [
        (r'/subscribe', EventHandler),
        (r'/widgets/([^/]+)', PublishHandler, args),
        (r'/dashboards/([^/]+)', PublishHandler, args),
        (r'/assets/(.*)', StaticFileHandler, dict(path=path + '/assets')),
        (r'/(.*)', MainHandler, dict(path=path)),
    ]
    return Application(
        urls,
        template_path=path + '/dashboards/',
        static_path=path + '/assets/',
        compiled_template_cache=False)


def make_jobs(path):
    jobs = {}
    mods = [f for f in os.listdir(path + '/jobs')
            if f.endswith('.py') and f != '__init__.py']
    if path not in sys.path:
        sys.path.append(path)
    for mod in mods:
        modname = 'jobs.' + os.path.splitext(mod)[0]
        jobs[mod] = __import__(modname, fromlist=['callback', 'callback_time'])
        PeriodicCallback(jobs[mod].callback, jobs[mod].callback_time).start()


def main(path, port=8888, auth_token=None):
    app = make_app(path, auth_token)
    app.listen(port)
    print 'Starting server on port {}'.format(port)
    make_jobs(path)
    try:
        IOLoop.instance().start()
    except KeyboardInterrupt:
        IOLoop.instance().stop()

if __name__ == '__main__':
    main(os.getcwd() + '/drax')
