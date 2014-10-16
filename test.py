import unittest
import sys
import os
from cStringIO import StringIO
import requests
from tornado.testing import AsyncHTTPTestCase

from drax import commands, server


class TestDraxCommandline(unittest.TestCase):

    def setUp(self):
        sys.stdout = StringIO()

    def test_main(self):
        # make sure the shuffled sequence does not lose any elements
        sys.argv = ['drax']
        commands.main()
        self.assertTrue(commands.usage in sys.stdout.getvalue())

        # Reset stdout
        sys.stdout = StringIO()
        sys.argv = ['drax', 'help']
        commands.main()
        self.assertTrue(commands.usage in sys.stdout.getvalue())
        
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


class TestDraxServer(AsyncHTTPTestCase):

    def get_app(self):
        path = os.getcwd() + '/drax'
        return server.make_app(path, auth_token=None)

    def test_index(self):
        response = self.fetch('/', method='GET')
        self.assertEqual(200, response.code)
        self.assertTrue('<title>Drax</title>' in response.body)

    def test_assets(self):
        assets = ['/app/main.js', '/app/widgets.jsx', '/app/main.css']
        results = [self.fetch(a, method='GET').code for a in assets]
        self.assertTrue(len(results) == 3)
        self.assertTrue(results, [200, 200, 200])

    def test_websocket(self):
        pass

if __name__ == '__main__':
    unittest.main()
