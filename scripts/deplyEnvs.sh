#!/bin/bash

PROJECT_PATH="${1}"
USERNAME="${2}"
for HOST in "${@:3}"
do
    scp -Cr .env "$USERNAME@${HOST}:${PROJECT_PATH}/current"
done
