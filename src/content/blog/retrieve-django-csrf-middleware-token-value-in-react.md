---
publish: false
title: How to retrieve Django CSRF middleware token value in React
description: ''
published: 'May 27 2023'
created: 'May 27 2023'
---

> This technique will only work if Django is serving the React app in a Hybrid setup. If you are using a separate server for the React app, you will need to use a different technique.

Django uses a middleware called `CsrfViewMiddleware` to add a CSRF (Cross-Site Request Forgery) token to HTTP requests. The CSRF protection is added when a user sends a POST request, which could potentially modify data.

Here's a simplified explanation of how the CSRF token is sent to the browser:

1. Initial Request: When a client makes an initial HTTP GET request to a Django server, the CsrfViewMiddleware gets activated.
2. If no CSRF token exists, Django generates a new one. The CSRF token is a random value - a unique, unpredictable value that is created for each session.
3. Django then sets this token in the client's browser as a cookie with the name `csrftoken`.

Cookies are small files which are stored on a user's computer by the web browser while browsing a website. They are often used to store information about a user's session, such as their login status, shopping cart contents, etc.

As an example, here is a sample Django response with a `Set-Cookie` header:

```

```

To retrieve the CSRF token in a React app, you will typically read the CSRF token from the `csrftoken` cookie that is set by the server, in this case Django. Once you have the CSRF token, you can send it as an HTTP header or as a POST parameter when you make a request that modifies server-side data. Django will validate the token to prevent cross-site request forgery attacks.

The exact code to read a cookie in JavaScript can vary, but here's an example function that reads a cookie given its name:

```js title="utils.js"
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const csrftoken = getCookie('csrftoken');
```

In React, you can use the `useEffect` hook to retrieve the CSRF token and store it in the app's state. This will ensure that the CSRF token is retrieved only once when the component is mounted.

```js title="App.js"
import React, { useEffect, useState } from 'react';

const getCsrfToken = () => {
  if (typeof window === 'undefined') return;
  const cookie = document?.cookie
    ?.split('; ')
    ?.find((row) => row.startsWith('csrftoken'))
    ?.split('=')[1];

  return cookie;
};

const App = () => {
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    setCsrfToken(getCsrfToken());
  }, []);

  return (
    <div>
      <h1>CSRF Token: {csrfToken}</h1>
    </div>
  );
};
```

Or you can use the `useRef` hook to store the CSRF token in a ref.

```js title="App.js"
import React, { useEffect, useRef } from 'react';

const App = () => {
  const csrfToken = useRef(null);

  useEffect(() => {
    csrfToken.current = getCsrfToken();
  }, []);

  return (
    <div>
      <h1>CSRF Token: {csrfToken.current}</h1>
    </div>
  );
};
```

You can then include this CSRF token in your AJAX or fetch request headers, or as part of your form data.

```js title="App.js"
import React, { useEffect, useState } from 'react';

const updateTitle = async (data) =>
  fetch('/api/data/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    body: JSON.stringify(data),
  });
```

The token will be validated by Django, and if it is valid, the request will be processed. Otherwise, Django will return a 403 Forbidden response.
Django will generate a new token for every subsequent request that does not include the previous token. This is to prevent replay attacks, where an attacker can use a token from a previous request to make a new request.
