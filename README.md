# FileShare App
This NodeJS app let't you upload files and generate a link to download them.
The generated links can be password protected as well.

# Setting up the app locally
## Prerequisites
- NodeJS v16.x
- MongoDB v4.x
- MongoDB Compass(optional)
- [tinyurl.com](https://tinyurl.com/) API key for shortening url links.

1. Install dependencies:
```sh
npm install
```

2. Run the app in devlopment environment:
- create ```dev.env``` file in root directory of the project with the following content:
```touch dev.env```
```sh
NODE_ENV=development
MONGODB_LOCAL_URI=mongodb://localhost:27017/filesDB
ACCESS_TOKEN=<your tinyurl api token>
UPLOAD_PIN=<UPLOAD PIN SECRET OF YOUR CHOICE>
SIGN_COOKIE=<ANY SECRET KEY OF YOUR CHOICE>
```
3. Finally start the app
```sh
npm run devstart
```
# Contributing
- Read the [Code of Conduct](./docs/code-of-conduct.md) first.
- Contibuting [guidelines](./docs/contributing/contributing.md)

