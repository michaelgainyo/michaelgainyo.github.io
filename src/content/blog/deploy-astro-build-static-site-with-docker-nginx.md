---
publish: true
title: How to deploy your Astro static site with Nginx and Docker
description: Learn to deploy an Astro static site with Nginx and Docker in this step-by-step tutorial. Boost your site's performance and scalability while simplifying your development workflow.
image: '/deploy-astro-nginx-docker.jpg'
published: May 30 2023
created: May 27 2023
---

Dockerizing an [Astro](https://astro.build/) static website is straightforward. First, we build the site and then serve it with a lightweight web server like Nginx or Apache.

Here is an example with Nginx.

1. Create a Dockerfile in your project root directory

```Dockerfile title="Dockerfile" {20, 23}
# ---- Base ----
FROM node:lts AS base
WORKDIR /app

COPY . .

# install all dependencies
RUN npm install

# ---- Build ----
FROM base AS build
WORKDIR /app

RUN npm run build

# ---- Release ----
FROM nginx:1.21-alpine

# copy static files to nginx server root
COPY --from=build /app/dist /usr/share/nginx/html

# start Nginx in the foreground when the container is run
CMD ["nginx", "-g", "daemon off;"]
```

Here we use a multi-stage build. In the first stage--base--we copy the project's content and install all the dependencies.

Next, we build the site. Note that the build artifacts will be in the `dist` directory unless you change the output directory in your Astro config.

In the last stage--release--we copy the build artifacts to the Nginx server root directory.

The path `/usr/share/nginx/html` is the default directory where Nginx looks for files to serve when running inside a Docker container.

2. Build the Docker image

```sh
docker build -t astro-nginx .
```

3. Run the Docker container

```sh
docker run -d -p 8080:80 --name astro-nginx astro-nginx
```

This command starts a Docker container from your image and maps port 8080 on your host to port 80 in the container, where Nginx is listening by default.

The `-d` flag runs the container in detached mode, and the `--name` flag gives the container a name.

After running these steps, your Astro site should be running at [http://localhost:8080](http://localhost:8080).

You can then deploy the container to your favorite cloud provider.
