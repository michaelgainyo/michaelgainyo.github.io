---
publish: true

title: 'Dockerizing a remix app in development'
description: ''
image: '/dockerize-remix-app.jpg'

published: 'May 25 2023'
created: 'May 25 2023'

tags: ['docker', 'remix']
---

It's not uncommon nowadays to develop apps in vscode dev containers. It is a great way to keep your dev environment consistent across different machines and projects.

Assuming you already have a Remix app set up, navigate to the root of the project and run:

```bash {1}
docker run -it --rm -p 3000:3000 -v $(PWD):/app -w /app node:19-alpine3.16 sh
/app # yarn
/app # yarn dev
```

The app loads just fine - everything works flawlessly. Except **`HMR`** doesn't.

This happens because the remix dev server, which uses web sockets to communicate with the browser, cannot reach the browser outside the container. So we need to expose the dev server to our host machine as well. Let's kill the container and run:

```bash /-p 8002:8002/
docker run -it --rm -p 3000:3000 -p 8002:8002 -v $(PWD):/app -w /app node:19-alpine3.16 sh
/app # yarn
/app # yarn dev
```

Now it does.

If you've modified the `devServerPort` in your remix config, expose that port instead and update the `<LiveReload />` port accordingly.

```tsx title="app/root.tsx"
//The default port is 8002
<LiveReload port={8002} />
```

Finally, here's a quick rundown on the previous docker commands:

- `docker run` is the base command for running a Docker container
- `-it` starts the container in interactive mode
- `--rm` removes the container when it exits
- `-p 3000:3000` maps port 3000 inside the container to port 3000 on your machine. Same as `-p 8002:8002`.
- `-v $(PWD):/app` creates a volume that mounts the working directory to the `/app` directory in the container. Changes made on your machine are reflected in the container and vice versa.
- `-w /app` sets the working directory to `/app` in the container
- `node:19-alpine3.16` is the official Node.js image we're using
- `sh` starts a shell inside the container

That's it.
