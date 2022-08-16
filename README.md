# Epilexo Stack
This repository contains instructions for setting up the epilexo environment through docker-compose.

## Requirements

In order to use this stack you need to have `docker` and `docker-compose` installed on your machine.

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


## Configurations

This section contains the information to configure the various machines and make customizations according to your working needs.

The reference point for this guide is the `docker-compose.yml` file and will now be analyzed section by section.

### Epilexo (nginx:latest)

This is the most important section because it contains the machine that runs the application interface.

There are two volumes:

 - the `dist` folder contains a built version of the front-end part of the application

 - under the `nginx` folder contains the server configuration to serve the application (nginx.conf)

	 - **IMPORTANT**: if you want to develop the stack locally, the nginx.conf file will contain the information to work the reverse-proxy and be able to reach the other machines built by docker; if you build the stack on a server, the `nginx.conf` file will only contain the information to tell the server where the folder with the built Angular project is located and all reverse-proxy info must be commented or deleted (if you want).

Another key option is `network_mode: host`, to be used only if you want to develop the stack locally; otherwise, this option should be commented on.


#### Change base-href 
Currently, the root base of the front-end project is 'epilexo-demo', but if you want to change the project name you need to download the project source and run the command:

 1. `ng build --prod --base-href /project-name/`
 2.  Copy the builded project in `epilexo/dist/project-name`
 3.  Then change the row of the `docker-compose.yml` (section `epilexo` -> `volumes`)

    volumes:
    
    - ./epilexo/dist/project-name:/usr/share/nginx/html/project-name
    
    - ./epilexo/nginx/nginx.conf:/etc/nginx/nginx.conf

 4. Finally change the statement in the `nginx.conf` file:
  
 ```
 location /project-name/ {
	 index index.htm index.html;
	 try_files $uri $uri/ /project-name/index.html;
}
```

5. Run in command line `docker-compose down` and then `docker-compose up -d`
