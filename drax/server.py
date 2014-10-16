import time
import json
import os
import imp
from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.websocket import WebSocketHandler


def merge_files(folder, extension, **kwargs):
    res = kwargs.get('comment', '')
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.endswith(extension):
                fd = open(root + '/' + f)
                res += '\n/* {0} file: {1} */\n'.format(extension, f)
                res += fd.read()
    return res


class MainHandler(RequestHandler):
    def get(self):
        self.render("index.html")


class AssetHandler(RequestHandler):
    def initialize(self, path):
        self.path = path

    def get(self, filename):
        assets = {
            'main.js': {
                'folder': self.path + 'assets/js',
                'mimetype': 'application/x-javascript',
                'extension': 'js'
            },
            'main.css': {
                'folder': self.path + 'widgets',
                'mimetype': 'text/css',
                'extension': 'css'
            },
            'widgets.jsx': {
                'folder': self.path + 'widgets',
                'mimetype': 'application/x-javascript',
                'extension': 'jsx',
                'comment': '/** @jsx React.DOM */\n'
            },
        }
        if filename in assets.keys():
            asset = assets[filename]
            self.set_header('Content-Type', asset['mimetype'])
            return self.write(merge_files(**asset))
        return self.send_error(404)


class PublishHandler(RequestHandler):
    def initialize(self, clients, messages, auth_token):
        self.clients = clients
        self.messages = messages
        self.auth_token = self.application.auth_token

    def post(self, widget):
        data = json.loads(self.request.body)
        if self.auth_token and data['auth_token'] != self.auth_token:
            return self.send_error(status_code=401)
        data.pop('auth_token', None)
        data['id'] = widget
        data['updatedAt'] = time.time()
        msg = json.dumps(data)
        for client in self.clients:
            client.write_message(msg)
        self.messages[widget] = msg
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
        (r'/', MainHandler),
        (r'/subscribe', EventHandler),
        (r'/app/(.*)', AssetHandler, dict(path=path)),
        (r'/assets/(.*)', StaticFileHandler),
        (r'/widgets/([^/]+)', PublishHandler, args),
    ]
    return Application(
        urls,
        template_path=path + '/templates/',
        static_path=path + '/assets/',
        compiled_template_cache=False)


def make_jobs(path):
    jobs = {}
    for f in os.listdir(path + '/jobs'):
        if f.endswith('.py'):
            jobs[f] = imp.load_source(f, path + '/jobs/' + f)
            PeriodicCallback(jobs[f].callback, jobs[f].callback_time).start()


def main(path, port=8888, auth_token=None):
    app = make_app(path, auth_token)
    app.listen(port)
    print 'Starting server on port {}'.format(port)
    make_jobs(path)
    try:
        IOLoop.instance().start()
    except KeyboardInterrupt:
        IOLoop.instance().stop()
