#!/bin/bash
git co gh-pages
cd ../papers/2015/impulse_response/wip
cp layout/application.css ../../../../aira/stylesheets/
cp one_network.json ../../../../aira/one_network.json
compressjs src/*.js ../../../../aira/javascripts/aira.min.js
cd ../../../../aira
datestring=date
echo "<!--$datestring-->" >> index.html
git add --all
git commit -m 'New version'
git push
