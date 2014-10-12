# -*- coding: utf-8 -*-
from setuptools import setup
import os
import sys


if sys.argv[-1] == 'publish':
    os.system('python setup.py sdist upload')
    sys.exit()


setup(
    name='dashboard',
    version='0.1.0',
    author='tax',
    author_email='paultax@gmail.com',
    include_package_data=True,
    description='Dashboard inspired by dashing build with python and react',
    long_description=open('README.md').read(),
    url='http://github.com/tax/dashboard',
    license='MIT',
    packages=['dashboard'],
    #scripts=['bin/mycommand'],
    entry_points={
        'console_scripts': ['dashboardtest=dashboard.server:main'],
    },
    install_requires=[
        'gevent>=1.0.0',
        'Flask>=0.10.1',
    ],
    zip_safe=False)
