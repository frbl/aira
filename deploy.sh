#!/bin/bash
git co gh-pages
cd ../papers/2015/impulse_response/wip
cp layout/application.css ../../../../aira/stylesheets/
cp one_network.json ../../../../aira/one_network.json
compressjs src/*.js ../../../../aira/javascripts/output.min.js
cd ../../../../aira
git add --all
git commit -m 'New version'
git push
