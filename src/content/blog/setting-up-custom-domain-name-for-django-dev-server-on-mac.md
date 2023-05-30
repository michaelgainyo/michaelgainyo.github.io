---
title: 'Setting Up A Custom Domain Name for Django Development Server on a Mac'
description: 'A step-by-step guide on setting up a custom domain name locally, including instructions for using nginx'
published: 'Jan 19 2023'
tags: ['nginx', 'django']
---

Setting up a custom domain name for the Django development server on a Mac is a simple process that can be completed in a few steps.

1. Head to the root directory of your Django project and run the following command:

```bash
./manage.py runserver
```

2. Open the terminal and edit the `/etc/hosts` file by running the command:

```bash
sudo nano /etc/hosts
```

This file is used to map hostnames to IP addresses on a local machine.

3. Add the following line to the `/etc/hosts` file, replacing **myproject.local** with the custom domain name that you would like to use:

```conf
127.0.0.1 myproject.local
```

4. Save and exit the `/etc/hosts` file.

5. Update the `settings.py` file by adding the custom domain name to list of allowed hosts. For example:

```py title="settings.py"
# ...
ALLOWED_HOSTS = ['myproject.local']
# ...
```

Alternatively, you can set it to `ALLOWED_HOSTS = ['*']` for development purposes.

Finally, open your web browser and navigate to [http://myproject.local:8000](http://myproject.local:8000) (or the port number you are using) to access your Django project on the custom domain name.

## Setting up a custom domain name using nginx

To set up a custom domain name for the Django development server on a Mac using nginx, follow these additional steps:

1. Install nginx on your Mac by running the command:

```bash
brew install nginx
```

2. Create a new nginx configuration file for your Django project by running the command:

```bash
sudo nano /opt/homebrew/etc/nginx/servers/myproject.conf
```

3. Add the following code to the `myproject.conf` file, replacing **myproject.local** with the custom domain name that you would like to use:

```conf
server {
    listen 80;
    listen [::]:80;
    server_name myproject.local;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

4. Save and exit the `myproject.conf` file.

5. Restart nginx by running the command:

```bash
brew services restart nginx
```

Finally, open your web browser and navigate to [http://myproject.local](http://myproject.local) to access your Django project on the custom domain name.

### Good to know

To stop nginx, run the command:

```bash
# ngin will restart automatically after reboot
nginx -s stop

# or stop the service using brew
sudo brew services stop nginx
```

To find the nginx configuration file path, run the command:

```bash
nginx -t
```
