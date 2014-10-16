import os
import sys
import shutil
import server

dirs = ['widgets', 'templates', 'assets']
usage = '''Commands:
  drax help                 # Shows this message
  drax init PROJECT_NAME    # Sets up new dashboard in directory
  drax start                # Starts the server in a drax project directory
'''


def main():
    if len(sys.argv) == 1:
        print usage
        return

    if sys.argv[1].lower() == 'init':
        init()
    elif sys.argv[1].lower() == 'start':
        start()
    elif sys.argv[1].lower() == 'help':
        print usage
    else:
        print usage
        print 'Could not find command "{0}".'.format(sys.argv[1])


def init():
    if len(sys.argv) < 3:
        print 'No project name given to create directory'
        print 'Example: drax init mydashboard'
        return

    project = sys.argv[2]
    project_dir = os.getcwd() + '/' + project
    if os.path.exists(project_dir):
        print 'Can not create project, directory: "{}" '\
              'allready exists.'.format(project_dir)
        return

    print 'Creating project {}'.format(project)
    root = os.path.abspath(os.path.dirname(__file__))
    for d in dirs:
        src = root + '/' + d
        dest = project_dir + '/' + d
        try:
            shutil.copytree(src, dest)
        except shutil.Error as e:
            print('Directory not copied. Error: %s' % e)
        except OSError as e:
            print('Directory not copied. Error: %s' % e)
        print '  Copy directory "{}"'.format(d)


def start():
    for d in dirs:
        if not os.path.exists(os.getcwd() + '/' + d):
            print 'This is not a drax project, directory "{}"'\
                  ' is missing'.format(d)
            return
    server.main(os.getcwd())
