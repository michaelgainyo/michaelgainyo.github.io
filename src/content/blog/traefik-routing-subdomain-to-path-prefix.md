---
publish: false
title: 'Routing a subdomain to a path prefix with Traefik and Nginx'
description: ''
published: 'May 26 2023'
tags: ['devops', 'traefik', 'nginx', 'docker']
---

Routing requests between services in a micro-service architecture can often present complex challenges. This complexity further intensifies when there's a need to map a subdomain to a path prefix of another service within Docker. Let's look at how to route a subdomain to a path prefix with Traefik and Nginx.

## Setting the Stage

Imagine you're dealing with an `admin` service, which serves as the central hub of your application's administrative dashboard. Accessible at `admin.miq.localhost`. The admin service also houses your app's API at `admin.miq.localhost/api`. However, for security considerations, it's preferred to keep this endpoint away from direct public exposure.

## Understanding the Setup

Traefik is a reverse proxy that can be configured to route requests to different services based on the request's host and path. It uses "labels" in Docker to dynamically discover and configure services. Traefik also has middleware support, which allows you to modify requests and responses before they reach their destination. A middleware can only change the path of a URL and not its host, which is where Nginx comes in. Nginx is a web server that can be configured to rewrite paths in requests before they reach their destination. So, we will use Traefik to route requests to the correct service. Nginx will serve as the public interface for the application's API at `api.miq.localhost` and funnel all requests from `api.miq.localhost` to `admin.miq.localhost/api`, effectively concealing the admin service from the end-user's view.

## Configuring Traefik and Nginx

Here's a sample `docker-compose.yml` file that configures Traefik and Nginx to achieve the desired result.

```yml title="docker-compose.yml" {18, 22, 30}
version: '3.8'
services:
  traefik:
    image: traefik:v2.10
    command:
      - --api.insecure=true
      - --providers.docker
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
    ports:
      - '80:80'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  nginx:
    image: nginx:1.25.0-alpine-slim
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    labels:
      - traefik.enable=true
      - traefik.http.routers.nginx.entrypoints=web
      - traefik.http.routers.nginx.rule=Host(`api.miq.localhost`)
  admin:
    build:
      context: .
      dockerfile: /path/to/admin/Dockerfile
    labels:
      - traefik.enable=true
      - traefik.http.routers.admin.entrypoints=web
      - traefik.http.routers.admin.rule=Host(`admin.miq.localhost`)
```

In this example, we have three services:

- The traefik service listens on port 80 and uses the Docker provider to discover other services.
- The nginx(api) service is running Nginx and uses the mounted nginx.conf file as its configuration.
- The admin service is a dummy service that will be used to test the routing.

We define `labels` for our api and admin services to ensure that Traefik routes incoming requests appropriately. Client sends a request to api.miq.localhost, Traefik routes the request to the nginx service, which then forwards the request to the admin service.

The `nginx.conf` file is where the magic happens:

```nginx title="nginx.conf" {6, 23}
server {
  listen 80;
  server_name api.miq.localhost;

  # use Docker DNS resolver to resolve the admin service's IP address
  resolver 127.0.0.11;

  location / {
    # preserve the client's original host
    proxy_set_header Host $host;

    # preserve the client's original IP address and request headers
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # preserve the client's original protocol
    proxy_set_header X-Forwarded-Proto $scheme;

    # forward the client's request to the admin's path
    # `$request_uri` contains the original request's path,
    # which is appended to the `proxy_pass` directive.
    # For example: api.miq.localhost/users -> http://admin/api/users
    proxy_pass http://admin/api$request_uri;
  }
}
```

### Troubleshooting

One of the challenges I encountered during this setup is a DNS resolution error. When the api service tries to resolve admin.miq.localhost to an IP address, it fails. Probably because Nginx isn't part of Docker's DNS system, and admin.miq.localhost is not a standard DNS record.

To fix this, I changed the proxy_pass directive in Nginx to use the Docker service name admin, which is resolvable within the Docker network. However, the error persisted - Nginx was still unable to resolve the service name admin. I was missing the resolver directive pointing to `127.0.0.11`

## Testing the Setup

To test the setup, we can use the `curl` command-line tool to send a request to the api service.

```bash
# `-v` flag to print the request's headers and response headers.
curl api.miq.localhost -v
```

In my case, the output looks like this:

```json
{ "message": "Hello World!" }
```

A plus! 👋🏽
