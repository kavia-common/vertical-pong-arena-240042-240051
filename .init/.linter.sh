#!/bin/bash
cd /home/kavia/workspace/code-generation/vertical-pong-arena-240042-240051/pong_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

