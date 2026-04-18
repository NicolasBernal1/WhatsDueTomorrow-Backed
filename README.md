# What's Due Tomorrow? - BackEnd

What's Due Tomorrow? is a web application made for students where they can organize subjects and assignments easily.

## Main Technologies
- NestJs
- TypeORM
- Swagger

## How to install
You can install it either by cloning this repository or with this image from Docker Hub: [What's Due Tomorrow? - Backend Image](https://hub.docker.com/r/nicolasbernal1/backend-wdt)

## Endpoints
Base URL: http://localhost:3000

Routes:
- /auth/register (POST)
- /auth/login (POST)
- /users/profile (DELETE)
- /subjects (GET)
- /subjects/classes (GET)
- /subjects/:id (GET)
- /subjects (POST)
- /subjects/:id (DELETE)
- /subjects/classes (POST)
- /subjects/classes/:id (DELETE)
- /assignments (GET)
- /assignments/subject/:subjectId (GET)
- /assignments/subject/:subjectId (POST)
- /assignments/:assignmentId (DELETE)

**This project is not deployed!!**

FrontEnd for the project: [What's Due Tomorrow? - FrontEnd](https://github.com/NicolasBernal1/WhatsDueTomorrow-Frontend)

