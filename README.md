# FileShare App ![CI](https://github.com/HarshitRV/FileShare/actions/workflows/node.js.yml/badge.svg)
This NodeJS app let't you upload files and generate a link to download them.
The generated links can be password protected as well.

# Setting up the app locally
## Prerequisites
- NodeJS v16.x
- MongoDB v5.x  [Windows](https://medium.com/@LondonAppBrewery/how-to-download-install-mongodb-on-windows-4ee4b3493514) | [Mac](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/)
- MongoDB Compass(optional) 
- [tinyurl.com](https://tinyurl.com/) API key for shortening url links.

1. Install dependencies:
```sh
npm install
```

2. Run the app in devlopment environment:
-  ```cd configs```
- create ```dev.env``` file in the configs folder with the following content:
```touch dev.env```
```sh
NODE_ENV=development
MONGODB_LOCAL_URI=mongodb://localhost:27017/filesDB
ACCESS_TOKEN=<your tinyurl api token>
UPLOAD_PIN=<UPLOAD PIN SECRET OF YOUR CHOICE>
SIGN_COOKIE=<ANY SECRET KEY OF YOUR CHOICE>
```
3. Make sure your mongoDB is running and accessible from your local machine.
4. Finally start the app
```sh
npm run devstart
```

# Running test cases
1. Install dependencies:
```sh
npm install
```
2. Make sure your mongoDB is running and accessible from your local machine.
3. Finally start the tests
```
npm run test
```

# Production api documentation
## [READ DOCS](https://documenter.getpostman.com/view/14307277/UzQyr4C8)
# Contributing
- Read the [Code of Conduct](./docs/code-of-conduct.md) first.
- Contibuting [guidelines](./docs/contributing/contributing.md)

