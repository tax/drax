# author: oskar.blom@gmail.com
#
# Make sure your gevent version is >= 1.0
import json
import gevent
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
from flask import Flask, Response
from flask import render_template, send_from_directory
from flask import abort, request
import time
import os

AUTH_TOKEN = None

def generate_jsx():
    res = '/** @jsx React.DOM */\n'
    for root, dirs, files in os.walk("widgets"):
        for f in files:
            if f.endswith('.jsx'):
                fd = open(root + '/' + f)
                res += '\n//jsx file: {0}\n'.format(f)
                res += fd.read()
    return res

def merge_files(folder, extension, comment=''):
    res = comment
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.endswith(extension):
                fd = open(root + '/' + f)
                res += '\n//{0} file: {1}\n'.format(extension, f)
                res += fd.read()
    return res


# SSE "protocol" is described here: http://mzl.la/UPFyxY
class ServerSentEvent(object):

    def __init__(self, data):
        self.data = data
        self.event = None
        self.id = None
        self.desc_map = {
            self.data : "data",
            self.event : "event",
            self.id : "id"
        }

    def encode(self):
        if not self.data:
            return ""
        lines = ["%s: %s" % (v, k) 
                 for k, v in self.desc_map.iteritems() if k]
        
        return "%s\n\n" % "\n".join(lines)

app = Flask(__name__)
subscriptions = []

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/assets/<path:filename>')
def assets(filename):
    files = {
        'application.js': {
            'folder': 'assets/js',
            'extension':'js'
        },
        'widgets.jsx': {
            'folder': 'widgets', 
            'extension': 'jsx',
            'comment': '/** @jsx React.DOM */\n'
        },
    }
    if filename in files.keys():
        return merge_files(**files[filename])
    return send_from_directory('assets', filename)

@app.route('/widgets/<widget>', methods=['POST'])
def publish(widget):
    data = json.loads(request.data)
    if AUTH_TOKEN and data["auth_token"] != AUTH_TOKEN:
        abort(401)
    del data["auth_token"]
    data['id'] = widget
    data['updatedAt'] = time.time()
    def notify():
        for sub in subscriptions[:]:
            sub.put(json.dumps(data))
    gevent.spawn(notify)    
    return Response(status=204)

@app.route("/subscribe")
def subscribe():
    def gen():
        q = Queue()
        subscriptions.append(q)
        try:
            while True:
                result = q.get()
                ev = ServerSentEvent(str(result))
                yield ev.encode()
        except GeneratorExit: # Or maybe use flask signals
            subscriptions.remove(q)

    return Response(gen(), mimetype="text/event-stream")

if __name__ == "__main__":
    #print generate_jsx()
    app.debug = True
    server = WSGIServer(("", 5000), app)
    server.serve_forever()
    # Then visit http://localhost:5000 to subscribe 
    # and send messages by visiting http://localhost:5000/publish