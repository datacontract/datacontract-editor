# Data Contract Editor

The [Data Contract Editor](https://editor.datacontract.com) is like VS Code, but for [data contracts](https://datacontract.com). It's enterprise-friendly as it stores your data contracts in your browser.

**Features**

- ✅ Syntax highlighting
- ✅ Code completion
- ✅ Error checking
- ✅ Live HTML preview
- ✅ Share data contracts via URLs

Try it out at [editor.datacontract.com](https://editor.datacontract.com).

![Data Contract Editor](images/screenshot.png)

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
cp public/templates.js dist/templates.js
# deploy dist folder
```
 
## How to update the templates

Templates are taken from the Data Contract CLI. To update the templates, do the following:

1. Copy the templates from `/datacontract-cli/datacontract/templates` to `public`: cp -r ../datacontract-cli/datacontract/templates public
2. remove .items() everywhere
3. Fix datacontract.html so that it does not contain all the wrapper stuff around it
4. `npm run precompile`

## License

[MIT](LICENSE)

## Credits

Created by [Dr. Simon Harrer](https://www.linkedin.com/in/simonharrer/) and [Jochen Christ](https://www.linkedin.com/in/jochenchrist/).

Supported by [INNOQ](https://www.innoq.com).
