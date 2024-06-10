# Data Contract Editor

The [Data Contract Editor](https://editor.datacontract.com) is like VS Code, but for [data contracts](https://datacontract.com). It's enterprise-friendly as it stores the data contracts in localStorage of your browser.

**Features**

- Syntax highlighting
- Code completion
- Error checking
- Live HTML preview
- Share data contracts via URLs

Try it out at [editor.datacontract.com](https://editor.datacontract.com).

## Development Setup

```bash
# run locally
npm install
npm run dev
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
