#!/bin/bash
. .env
PS3='Please enter your choice or ctrl-c for quit: 1) startserver 2) generatekeys 3)Quit '
options=("startserver" "generatekeys" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "startserver")
            docker-compose build --no-cache
            docker-compose up
            ;;
        "generatekeys")
            echo "running in container npm for vapid keys - if you change them you have to adjust the app.js public Key!" && docker exec -ti sw_web_1 ash -c "npm run web-push generate-vapid-keys >> keys.txt"
            ;;
        "Quit")
            break
            ;;
        *) echo invalid option;;
    esac
done


#docker-compose build --no-cache
#docker-compose up
#fixme - i need a new menu for that stuff!
#if [ "$1" == "addvapidkeys" ]; then
 # echo "running in container npm for vapid keys" && docker exec -ti sw_web_1 ash -c "npm run web-push generate-vapid-keys"
