#!/bin/bash
. .env
PS3='Please enter your choice: 1) startserver 2) generatekeys - DANGEROUS 3) open shell of container 4) install firebase-tools 5) Quit '
options=("startserver" "generatekeys" "shell" "fb" "Quit")
select opt in "${options[@]}"
do
    case $opt in
        "startserver")
            docker-compose build --no-cache
            docker-compose up -d
            ;;
        "generatekeys")
            echo "running in container npm for vapid keys - if you change them you have to adjust the app.js public Key!" && docker exec -ti sw_web_1 ash -c "npm run web-push generate-vapid-keys >> keys.txt"
            ;;
        "shell")
            echo "now connect to container..."
            docker exec -it sw_web_1 ash
            ;;
        "fb")
            echo "now install firebase-tools in container"
            docker exec -ti sw_web_1 ash -c "npm install -g firebase-tools"
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
