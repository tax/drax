import unittest
import sys
import os
from cStringIO import StringIO
import json
import tornado.testing
from tornado.websocket import websocket_connect

from drax import commands, server


class TestDraxCommandline(unittest.TestCase):

    def setUp(self):
        self.original_stdout = sys.stdout
        sys.stdout = StringIO()

    def tearDown(self):
        sys.stdout = self.original_stdout

    def test_main(self):
        # make sure the shuffled sequence does not lose any elements
        sys.argv = ['drax']
        commands.main()
        self.assertTrue(commands.USAGE in sys.stdout.getvalue())

        # Reset stdout
        sys.stdout = StringIO()
        sys.argv = ['drax', 'help']
        commands.main()
        self.assertTrue(commands.USAGE in sys.stdout.getvalue())
        
        # Reset stdout
        sys.stdout = StringIO()
        sys.argv = ['drax', 'xx']
        commands.main()
        self.assertTrue('Could not find command "xx"' in sys.stdout.getvalue())

    def test_init(self):
        sys.argv = ['drax', 'init']
        commands.main()
        self.assertTrue('No project name given' in sys.stdout.getvalue())

        # Drax dir exists so server should not start
        sys.stdout = StringIO()
        sys.argv = ['drax', 'init', 'drax']
        commands.main()
        self.assertTrue('drax" allready exists' in sys.stdout.getvalue())

    def test_start(self):
        sys.argv = ['drax', 'start']
        commands.main()
        self.assertTrue('This is not a drax project' in sys.stdout.getvalue())


class TestDraxServer(tornado.testing.AsyncHTTPTestCase):

    def get_app(self):
        path = os.getcwd() + '/drax'
        return server.make_app(path, auth_token='secret')

    def test_index(self):
        response = self.fetch('/', method='GET')
        self.assertEqual(200, response.code)
        self.assertTrue('<title>Drax</title>' in response.body)

    def test_assets(self):
        assets = ['/app/main.js', '/app/widgets.jsx', '/app/main.css']
        results = [self.fetch(a, method='GET') for a in assets]
        self.assertEqual(3, len(results))
        self.assertEqual([200, 200, 200], [r.code for r in results])

        # Body should contain more then a KB of data
        has_content = [len(r.body) > 1024 for r in results]
        self.assertEqual([True, True, True], has_content)

        result = self.fetch('/app/wrong.js', method='GET')
        self.assertEqual(404, result.code)

    def test_authentication(self):
        data = {
            'auth_token': 'dontknow', 'value': 99, 'id': 'mywidget'
        }
        body = json.dumps(data)
        response = self.fetch('/widgets/mywidget', method='POST', body=body)
        self.assertEqual(401, response.code)

        del data['auth_token']
        body = json.dumps(data)
        response = self.fetch('/widgets/mywidget', method='POST', body=body)
        self.assertEqual(401, response.code)

        data['auth_token'] = 'secret'
        body = json.dumps(data)
        response = self.fetch('/widgets/mywidget', method='POST', body=body)
        self.assertEqual(204, response.code)

        event = json.loads(server.messages['mywidget'])
        self.assertIn('updatedAt', event['data'], 'updatedAt should be added')
        self.assertNotIn('auth_token', event['data'], 'auth_token not removed')


class TestDraxServerEvents(tornado.testing.AsyncHTTPTestCase):

    def get_app(self):
        path = os.getcwd() + '/drax'
        server.messages = {}
        server.clients = []
        return server.make_app(path, auth_token='secret')

    @tornado.testing.gen_test
    def test_websocket(self):
        url = 'ws://localhost:%d/subscribe' % self.get_http_port()
        ws = yield websocket_connect(url, io_loop=self.io_loop)
        self.assertEqual(1, len(server.clients))

        server.clients[0].write_message("My event")
        response = yield ws.read_message()
        self.assertEqual('My event', response)


if __name__ == '__main__':
    unittest.main()
