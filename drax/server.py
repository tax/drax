import time
import json
import os
import imp
from tornado.ioloop import IOLoop, PeriodicCallback
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.websocket import WebSocketHandler


AUTH_TOKEN = None
PATH = os.getcwd()
assets = {
    'main.js': {
        'folder': 'assets/js',
        'mimetype': 'application/x-javascript',
        'extension': 'js'
    },
    'main.css': {
        'folder': 'widgets',
        'mimetype': 'text/css',
        'extension': 'css'
    },
    'widgets.jsx': {
        'folder': 'widgets',
        'mimetype': 'application/x-javascript',
        'extension': 'jsx',
        'comment': '/** @jsx React.DOM */\n'
    },
}
clients = []
messages = {}


def merge_files(folder, extension, **kwargs):
    res = kwargs.get('comment', '')
    for root, dirs, files in os.walk(PATH + '/' + folder):
        for f in files:
            if f.endswith(extension):
                fd = open(root + '/' + f)
                res += '\n/* {0} file: {1} */\n'.format(extension, f)
                res += fd.read()
    return res


class MainHandler(RequestHandler):
    def get(self):
        self.render(PATH + "/templates/index.html")


class AssetHandler(RequestHandler):
    def get(self, filename):
        if filename in assets.keys():
            asset = assets[filename]
            self.set_header('Content-Type', asset['mimetype'])
            return self.write(merge_files(**asset))
        return self.send_error(404)


class PublishHandler(RequestHandler):
    def initialize(self, clients, messages):
        self.clients = clients
        self.messages = messages

    def post(self, widget):
        data = json.loads(self.request.body)
        if AUTH_TOKEN and data['auth_token'] != AUTH_TOKEN:
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


def start_jobs():
    jobs = {}
    for f in os.listdir(PATH + '/jobs'):
        if f.endswith('.py'):
            jobs[f] = imp.load_source(f, PATH + '/jobs/' + f)
            PeriodicCallback(jobs[f].callback, jobs[f].callback_time).start()


def main():
    args = dict(clients=clients, messages=messages)
    app = Application([
        (r'/', MainHandler),
        (r'/subscribe', EventHandler),
        (r'/app/(.*)', AssetHandler),
        (r'/assets/(.*)', StaticFileHandler, dict(path=PATH + '/assets/')),
        (r'/widgets/([^/]+)', PublishHandler, args),
    ], compiled_template_cache=False)
    app.listen(8888)
    print 'Starting server on port 8888'
    start_jobs()
    try:
        IOLoop.instance().start()
    except KeyboardInterrupt:
        IOLoop.instance().stop()
