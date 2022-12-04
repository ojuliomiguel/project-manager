# Desafio Técnico 

### [Requisitos](/doc/Desafio%20t%C3%A9cnico%20-%20pleno.pdf)
 
### [Endpoints (Utilizar o insomnia)](/doc/Insomnia_2022-12-04.json)

## Tech

- node.js - javascript runtime
- [adonisJS](https://adonisjs.com/) - Uma estrutura web completa para o Node.js
- docker
- postgres

## Instalação

- Node >= v16.13.2
- docker

> Recomendo utilizar yarn

Modificar o arquivo `docker-compose.yml` com os dados de sua preferencia e subir
o banco com o comando:

```bash
$ docker compose up -d
```

```yml
version: "3.9"
services: 
  producst-manager-db:
    volumes: 
      - /var/lib/pg_project_manager/pgdata:/var/lib/postgresql/data
    image: postgres
    ports:
      - '5479:5432'
    environment:
      POSTGRES_USER: julio
      POSTGRES_PASSWORD: code42
      POSTGRES_DB: projects_db
```

criar um arquivo .env com base no .env.exemplo do projeto

```
PORT=4444
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=HOdZxdLL-3vXQXTxG_vDiHqUGF4VC2rE
DRIVE_DISK=local
DB_CONNECTION=pg
PG_HOST=localhost
PG_PORT=5432
PG_USER=lucid
PG_PASSWORD=
PG_DB_NAME=lucid
```

```bash
$ yarn install
```

## Subindo as migrations

```bash
$ node ace migration:run
```

## Executando a app

```bash
# development
$ yarn dev

# production mode
$ yarn build
$ yarn start
```