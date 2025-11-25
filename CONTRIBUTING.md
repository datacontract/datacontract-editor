# Contributing

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at http://localhost:5173

## Build

```bash
# Build for production
npm run build

# Build embeddable library
npm run build:lib

# Build both
npm run build:all
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
