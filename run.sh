#!/bin/bash

PI_PHOTOGATE_PATH=$(nodejs -p "require('./config.json')['piPhotogatePath']")
PI_SSH_ADDRESS=$(nodejs -p "require('./config.json')['piSSHAddress']")

stdbuf -oL -eL ssh -t $PI_SSH_ADDRESS "stdbuf -oL -eL sudo $PI_PHOTOGATE_PATH" | nodejs main.js
