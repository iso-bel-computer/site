#!/bin/bash

cd ~/05.Site
git add .
git commit -m "${1:-Quick update}"
git push 
ssh 1sobel@ssh.pythonanywhere.com "cd ~/site && git pull && touch /var/www/1sobel_pythonanywhere_com_wsgi.py"
