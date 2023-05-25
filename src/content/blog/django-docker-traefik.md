---
title: 'Django Docker Traefik'
description: ''
pubDate: 'May 20 2023'
heroImage: ''
---

https://testdriven.io/blog/django-docker-traefik/

## Setup

```sh title="s.sh"
mkdir django-docker-traefik && cd $_
python3.11 -m venv env
source env/bin/activate
mkdir server && cd $_
```

2. Create a Django project

Install dependencies

```sh
pip3 install django
django-admin startproject config .
pip3 freeze > requirements.txt
```

```sh {3}
.
├── env
└── server
    ├── config
    │   ├── __init__.py
    │   ├── asgi.py
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── manage.py
    └── requirements.txt
```

3. Create a Dockerfile

create a Dockerfile

```sh
touch Dockerfile
```

```Dockerfile

```

4. Create a docker-compose.yml

go back to the root directory and create a docker-compose.yml

```sh
cd ../
touch docker-compose.yml
```

```yml

```

build the image and run the container

````sh

```sh
docker-compose build
docker-compose up
````

Navigate to [http://localhost:8000](http://localhost:8000) and you should see the Django welcome page.

5. Adding postgresql

instal dependencies

```sh
pip3 install psycopg2-binary django-environ
```

Update the docker-compose.yml file and add a new service for postgres

```yml {3-4, 9, 16-18, 20-29}
version: '3.8'

volumes:
  postgres_data:

services:
  web:
    build: ./server
    command: sh -c 'while !</dev/tcp/db/5432; do sleep 1; done; python manage.py runserver 0.0.0.0:8000'
    volumes:
      - ./server:/app
    ports:
      - 8000:8000
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://pguser:pgpwd@db:5432/pgdb
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    expose:
      - 5432
    environment:
      - POSTGRES_USER=pguser
      - POSTGRES_PASSWORD=pgpwd
      - POSTGRES_DB=pgdb
```

Update `settings.py` to use the environment variables

```python {8-9}
import environ

env = environ.Env()

# ...

DATABASES = {
    'default': env.db()
}

# ...
```

Rebuild the image and run the container

```sh
docker-compose up --build
```

open a new terminal and run migrations

```sh
docker-compose exec web python manage.py migrate --noinput
```

Check the database

```sh
docker-compose exec db psql --username=pguser --dbname=pgdb
```

run and make sure `pgdb` is in the list of databases

```sh
pgdb=# \l

pgdb=# \c pgdb
You are now connected to database "pgdb" as user "pguser".

pgdb=# \dt

pgdb=# \q
```

Check taht the volume is created

```
docker volume ls
docker volume inspect django-docker-traefik_postgres_data
```

1. Adding pgadmin

Update the docker-compose.yml file and add a new service for pgadmin

```yml {3-4, 9, 16-18, 20-29}
...
services:
  web:
    ...
    depends_on:
      - db
      - pgadmin

  db:
    ...

   environment:
      - PGADMIN_DEFAULT_EMAIL=admin@mail.com
      - PGADMIN_DEFAULT_PASSWORD=admin
    ports:
      - 5433:80
    depends_on:
      - db
```

Rebuild the image and run the container

```sh
docker-compose up --build
```

Now you can access pgadmin at [http://localhost:5433](http://localhost:5433)

Once you login with the credentials you set in the environment variables, you can add a new server.

click on Object > Register > server

<!-- ![pgadmin](./images/pgadmin.png) -->

In the general tab, give a name to the server
in the connection tab, enter the following, the host name is the name of the service in the docker-compose.yml file our case : `django-docker-traefik-db-1`. Port is `5432` and username(`pguser`) and password(`pgpwd`) are the ones you set in the environment variables. Don't worry about the rest of the fields.

1. Adding Gunicorn

Install dependencies(add to requirements.txt)

```sh
pip3 install gunicorn
```

Add a new docker-compose.prod.yml file

```sh
touch docker-compose.prod.yml
```

```yml

```

Add a new Dockerfile.prod file to the server folder

```sh
cd server
touch Dockerfile.prod
cd ../
```

```Dockerfile

```

Rebuild the image and run the container

```sh
docker-compose -f docker-compose.prod.yml up --build
```

Run migrations

```sh
docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
```

1. Adding Traefik

add a new file `traefik.yml` in the root

```sh
touch traefik.yml
```

```yml

```

django now at http://django.localhost

dashboard at http://django.localhost:8080/dashboard/#/

1. Adding whitenoise for production

Install dependencies(add to requirements.txt)

```sh
pip3 install whitenoise
```

Update `settings.py`

```python {8-9}
import environ
# ...
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <
    # ...
]
# ...
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

Collectstatic

```sh
docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --no-input --clear
```
