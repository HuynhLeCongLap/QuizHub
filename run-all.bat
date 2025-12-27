@echo off
start cmd /k "cd backend-springboot && mvn spring-boot:run"
start cmd /k "cd frontend-angular && npm start"
