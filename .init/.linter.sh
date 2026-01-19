#!/bin/bash
cd /home/kavia/workspace/code-generation/task-management-app-307555-307565/todo_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

