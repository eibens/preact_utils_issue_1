# preact_utils Issue 1

> NOTE: This issue has now been fixed with version `v1.0.0-alpha.1` of
> [preact_utils](https://github.com/eibens/preact_utils).

Run this to bundle the file, start a server, and opening the browser:

```ts
deno bundle index.tsx index.js && http-server -p 8080 & xdg-open http://localhost:8080
```

The page should be white and the console should show this error:

```txt
Uncaught ReferenceError: createElement is not defined
```
