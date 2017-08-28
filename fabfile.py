#!/usr/bin/env python

import os
from fabric.api import *
from fabric.colors import green
import SimpleHTTPServer
import SocketServer
import webbrowser

def build():
	local('npm run build')

def preview():
	local('npm run start')

def watch():
	local('npm run watch')	

def deploy():
	print green('Deploying site...')
	local('aws s3 cp build s3://joecmarshall/ --recursive')
	print green('Site deploy complete.')