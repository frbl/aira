#!/bin/bash
git co master
cp layout/application.css ../application.css
cp one_network.json ../one_network.json
compressjs src/*.js ../aira.min.js
git co gh-pages
mv ../application.css stylesheets/application.css
mv ../one_network.json one_network.json
mv ../aira.min.js javascripts/aira.min.js

sed '$ d' index.html> index.html.tmp
mv index.html.tmp index.html
datestring=`date`
echo "<!--$datestring-->" >> index.html
git add --all
git commit -m 'New version'
git push
