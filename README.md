# Distributed Database Architecture

Microservice capable of providing CRUD (CREATE, READ, UPDATE, DELETE) functionalities for a `User` entity on top of a distributed data architecture. The public interface of the system is based on a RESTFul Microservices API conformed by:

```
GET /api/users/{userID}      (READs an user)
POST /api/users/             (CREATEs an user)
PUT /api/users/              (UPDATEs an user)
DELETE /api/users/{userID}   (DELETEs an user)
```

*NOTE:* the API allows partial updates, using a non-complete Entity schema.

### User entity schema
```
{
  id: '13AE742',
  name: 'John Doe',
  email: 'john.doe@gmail.com',
  group: 3
}
```
There is a schema validation on `User`.

## Packaging / Orchestration engine

Docker - [Docker Compose](https://docs.docker.com/compose/)

The microservice uses 2 Dockerfiles (Gateway and DB/Aggregator) and a `docker-compose.yaml` file to coordinate the startup and the default configuration of the processes.

## Getting started
You need git to clone the `distributed-database-architecture` repository. You can get git from [http://git-scm.com/](http://git-scm.com/):

```
$ git clone https://jesusbarros@bitbucket.org/jesusbarros/distributed-database-architecture.git
```
Enter the git clone `distributed-database-architecture` directory:

```
$ cd distributed-database-architecture
```
Download images, generate and run services with `docker-compose`:
```
$ docker-compose up
```

The API gateway listens to requests on port 8080 as default. You can change the default port in `docker-compose.yml` file.

## Running tests
For running tests, simply issue:
```
$ docker-compose exec gateway yarn test
```

## Getting started
Clone the repository:

```
$ git clone https://jesusbarros@bitbucket.org/jesusbarros/distributed-database-architecture.git
```
Enter the `distributed-database-architecture` directory:

```
$ cd distributed-database-architecture
```
Download images, generate and run services with `docker-compose`:
```
$ docker-compose up
```

The API gateway will listen to requests on port 8080 by default. You can change the default port in `docker-compose.yml` file.

## Running tests
For running tests, simply issue:
```
$ docker-compose exec gateway yarn test
```

## Distributed Database Architecture (Details)

![](https://user-images.githubusercontent.com/8838365/92979274-71362d80-f492-11ea-8bbf-ee7d09580da2.png)

The system is built using 2 type of Node.js processes:

### Gateway process

`container name: gateway`

*(number of containers GW_N=1)*

Hosts the RESTful API and communicates with the DB processes.

### DB processes
`container names: db-0, db-1, db-2`

*(number of containers DB_N=3)*

Each process stores one or multiple database shards/partitions of the complete `Users` data inside of their embedded [RocksDB](https://rocksdb.org/) tables.

On every API request the Gateway needs to communicate with the DB processes to obtain and modify the data stored in one or multiple shards.

### Features

#### Liveness checks:

- The system is able to respond correctly in less than 250 ms. to all basic CRUD requests.

#### Safety checks:

- The system is able to support the downtime of 1 DB process without any problem to the READ service.
- The system is able to recover a failed DB process after a successful restart (we can test this with: `docker-compose stop db-1; sleep 60; docker-compose start db-1;`).

#### Performance / Complexity

- The cyclomatic complexity of each operation does not increase with `DB_N`, it is `<= (DB_N/2) + 1` (Quorum size).
- The DB space complexity is kept `<=2` times the total size of the data stored.
