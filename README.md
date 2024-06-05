# datacontract-studio

```bash
# run locally
npm install
npm run serve
```

```bash
# build for production
npm install
npm run build
```

## How to update the templates

1. cp -r ../datacontract-cli/datacontract/templates public
2. remove .items() everywhere
3. Fix datacontract.html so that it does not contain all the wrapper stuff around it
4. `npm run precompile`
