import unittest
import sys
from cStringIO import StringIO

from drax import commands


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

if __name__ == '__main__':
    unittest.main()
