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


#### *Change base-href* 
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


TODO: authentication parameters by angular way


### Lexo-backent-itant

This part concerns the machines that host the lexicon services, and is composed of a database in mysql and a tomcat machine that houses the swagger and the lexicon management logic.


#### *Database configuration*

The database configuration can be found in a file under the `lexo-backend-itant/db` folder. In it there is an SQL procedure that creates a database named `lexo_server` (encoded in UTF-8) and a user (named `lexo`) with full privileges.

These are the instructions contained in the `init.sql` file.

```
CREATE  DATABASE lexo_server CHARACTER  SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'lexo'@'%' IDENTIFIED BY  'LexOServer12';

GRANT ALL PRIVILEGES ON *.* TO  'lexo'@'%';

FLUSH PRIVILEGES;
```

It is important that the `%` character is present in order to accept incoming connections from any source.

#### *Tomcat configuration*

Regarding the configuration of the tomcat server that hosts the backend services for the management of the lexicons, two files must be considered within the path `lexo-backent-itant/tomcat/LexO-backend-itant/WEB-INF/ classes`, that is `hibernate.cfg.xml` and` lexo-server.properties`.

 - In the `hibernate.cfg.xml` file you have to make sure that there is the information to be able to connect to the previously created database on which the tomcat server is based.  In the example below we can see the address to the server (you can also use the machine name given with docker-compose) with the credentials used in the `init.sql` file for creating users and databases.

   ```
   ...
   <property  name="hibernate.connection.url">jdbc:mysql://lexo-backend-itant-db_demo:3306/lexo_server?characterEncoding=UTF-8&amp;serverTimezone=Europe/Rome</property>
   <property  name="hibernate.connection.username">lexo</property>
   <property  name="hibernate.connection.password">LexOServer12</property>
   ...
   ```

- In the file `lexo-server.properties` instead you can find the parameters to connect to the` graphdb` machine that manages the RDF triples containing the ontological information of the lexicon under management (p.s: in local development it is important that the precise IP address is specified because unfortunately the machine cannot resolve the nominal addresses that are set via docker-compose)

	```
	...
	GraphDb.url=http://172.20.0.2:7200
	GraphDb.repository=ExportedItAnt
	...
	```



### Graphdb

For the development of this machine we rely on the `Dockerfile` present in the path `graphdb/free-edition`, inside which there is also the `.zip` file containing the graphdb sources.
Currently there is a repository with raw data belonging to the ItAnt project, but it is possible to insert a custom dictionary through the use of volumes in the path `graphdb/graphdb-data/workbench-import` where you have to insert the `.ttl` file containing the reference ontology.

***Configure repository***

[work in progress]

***Change base href***

To change the base-href of the machine (according to your needs) you need to set this information in the Dockerfile using the following commands:

`CMD  ["-Dgraphdb.external-url=https://lari2.ilc.cnr.it/graphdb_demo"]`

There are also configurations inside the docker-compose.yml file, but apparently the information recorded comes mainly from the Dockerfile, for reasons that are currently unknown.

### Keycloak

The Keycloak part is about authentication for accessing the front-end interface through federated authentication. Inside the stack is the part that contains the most customizations.

***Docker-compose customization***

Through the environment variables it is possible to set a series of parameters, including the admin user and some DB settings. It is also possible to import old realm configurations.

Here are some environment variables present in the `docker-compose.yml`:

```
DB_VENDOR: POSTGRES
DB_ADDR: postgres
DB_DATABASE: keycloak
DB_USER: keycloak
DB_SCHEMA: public
DB_PASSWORD: password
KEYCLOAK_USER: admin
KEYCLOAK_PASSWORD: admin
PROXY_ADDRESS_FORWARDING: "true" #used for server development
KEYCLOAK_IMPORT: /tmp/import/realm-export.json
```


***Change web context***

By default, Keycloak redirects the traffic of services to the address `/ auth`, but for different needs it is possible to change this address (eg: I want to set up a second authentication server detached from one already present).

To do this you need to edit two files, `standalone.xml` and` standalone-ha.xml`. Within these files you must modify exactly this node, setting a value of your choice:

``
<web-context> your_preferred_name </web-context>
``

These files must be served to the virtual machine via the host across the volumes. In fact, the following directives must be set:

```
volumes:
       - ./keycloak/conf/standalone.xml:/opt/jboss/keycloak/standalone/configuration/standalone.xml
       - ./keycloak/conf/standalone-ha.xml:/opt/jboss/keycloak/standalone/configuration/standalone-ha.xml
       - ./keycloak/import/:/tmp/import
```

In this way, when the machine is bootstraped, the instructions will be read and the web-context set.


**IMPORTANT**: currently, the configuration that is loaded is that relating to the PRIN-CNR context, but it is possible to omit the import of an existing realm and create another one from scratch. Clearly, it is then necessary to configure the front-end services that interact with keycloak (I'll talk about this later).
