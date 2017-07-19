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

def staging():
	env.description = "staging"
	env.hosts = ['138.197.125.212']
	env.user = 'root'
	env.key_filename = '~/.ssh/id_rsa'
	env.remote_filepath = '/var/www/html'

def deploy():
	print "Deploying site to", env.hosts[0]
	put('build/*', env.remote_filepath)
	print green('Site deploy complete.')