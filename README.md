# Epilexo Stack
This repository contains instructions for setting up the epilexo environment through docker-compose.

## Requirements

In order to use this stack you need to have `docker` and` docker-compose` installed on your machine.

## Components

The `docker-compose.yml` file contains all the instructions for creating the virtual machines that host the various back-end services and the epilexo front-end. It also contains information on volumes for data persistence and the addition / modification of some server configuration parameters.

The machines that make up the stack are the following:
 
  - CASH (openjdk: 16) & CASH_DBMYSQL (mysql: latest)
  - KEYCLOAK (14) & POSTGRES (11)
  - LEXO-ITANT (tomcat9) & LEXO-ITANT-DB (mysql: 8)
  - GRAPHDB (9.9.0 free-edition)
  - LEIDEN (nodejs: latest)
  - EPILEXO (nginx: latest)

These configurations can be used to create the environment both locally and on a server.

## Run the stack

To start the entire stack, the user must run the following command from the terminal:

`docker-compose up -d`


Once the command is started, docker will download the images and "mount" the various machines afterwards, in a predetermined order.

When docker is done, use the `docker ps` command to display a table with the machines running and their various IP addresses and names.
