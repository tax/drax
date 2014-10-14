import os
import sys

usage = '''Commands:
  drax help                 # Shows this message
  drax init PROJECT_NAME    # Sets up new dashboard in directory
  drax start                # Starts the dashboard server
'''


def main():
    if len(sys.argv) == 1:
        print usage
        sys.exit()

    if sys.argv[1].lower() == 'init':
        init()
    elif sys.argv[1].lower() == 'start':
        start()
    elif sys.argv[1].lower() == 'help':
        print usage
    else:
        print usage
        print 'Could not find command "{0}".'.format(sys.argv[0])


def init():
    if len(sys.argv) < 3:
        print 'No project name given to create directory'
        print 'Example: drax init mydashboard'

    project_dir = os.getcwd() + '/' + sys.argv[2]
    if os.path.exists(project_dir):
        print 'Can not create project, directory: "{}" '\
              'allready exists.'.format(project_dir)
        return
    # Copy files
    print 'Copy from ' + os.path.abspath(os.path.dirname(__file__))
    print 'Copy to ' + project_dir
    # Check if dir allready exists
    return


def start():
    print 'start'
