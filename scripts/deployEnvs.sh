#!/bin/bash

PROJECT_PATH="${1}"
USERNAME="${2}"
HOST="${3}"
scp -Cr .env "$USERNAME@${HOST}:${PROJECT_PATH}/current"
