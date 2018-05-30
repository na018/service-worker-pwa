#!/bin/bash

. .env
docker-compose build --no-cache
docker-compose up 
#fixme - i need a new menu for that stuff!
#if [ "$1" == "addvapidkeys" ]; then
 # echo "running in container npm for vapid keys" && docker exec -ti sw_web_1 ash -c "npm run web-push generate-vapid-keys"


