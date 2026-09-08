# Contributing

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at http://localhost:5173

## Tests

Unit tests live next to the code as `src/**/*.test.js` and run with vitest:

```bash
npm test
```

## Build

Builds the ES module and the standalone app for production to the `dist` folder.
```bash
npm run build
```

## Standalone

This will run the app in standalone mode.

```bash
npm start
```

Opens the app at http://localhost:9090

After publishing to npm:

```
npx datacontract-editor
```



## Publish

```bash
npm login
npm publish
```
