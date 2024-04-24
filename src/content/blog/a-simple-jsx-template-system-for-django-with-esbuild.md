---
publish: false

title: 'A simple jsx based template system for Django with esbuild'
description: ''
image: ''

published: 'Jul 26 2023'
created: 'Jul 26 2023'

tags: ['django templates', 'jsx', 'tsx', 'ssg']
---

Django's very own template system sucks, so does Jinja. In this post I will show you how to use jsx as a template system for Django.

Let's start with a simple Django project.

```bash
django-admin startproject mysite && cd $_
yarn init -y
```

Now we need to install some dependencies.

```bash
yarn add -D esbuild ws react react-dom
```

We're going to build a dev server in node, which scans a `src/pages` directory for jsx files, triggers rendering some JSX files to their corresponding `<filename.jsx>` on saves. Then use websockets to trigger a page reload on the client.

Let's start with the dev server.

```js
// dev-server.js
const { build } = require('esbuild');
const { readFile, writeFile } = require('fs/promises');
const { createServer } = require('http');
const { createServer: createWsServer } = require('ws');
const { join } = require('path');

const PORT = 3000;
const SRC_DIR = join(__dirname, 'src');
const PAGES_DIR = join(SRC_DIR, 'pages');
const BUILD_DIR = join(__dirname, 'build');
```

Now we scan the pages folder for jsx files and build them to their corresponding html files in the build folder.

```js

const build = ()=>{
  const files = await readdir(PAGES_DIR);
  const jsxFiles = files.filter((file) => file.endsWith('.jsx')|| file.endsWith('.tsx'));
  const buildFiles = jsxFiles.map((file) => {
    const filePath = join(PAGES_DIR, file);
    const buildPath = join(BUILD_DIR, fileName);

    const tempFile = join(tmpdir(), "tc39-template.js");
    try {
        const result = buildSync({
        logLevel: "warning",
        platform: "node",
        bundle: true,
        outfile: tmpFile,
        entryPoints: [filePath],
        });

        if (!result.errors.length) {
          try {
            const require = createRequire(import.meta.url);
            eval(readFileSync(tmpFile, "utf8"));
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
          console.log(error);
      }

  });

}

```
