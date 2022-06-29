# FileShare App
This NodeJS app let't you upload files and generate a link to download them.
The generated links can be password protected as well.

# Setting up the app
1. Install dependencies:
```sh
npm install
```
2. Create a configs folder and put the dev.env file in it:
```sh
mkdir configs
cd configs
touch dev.env
```
3. Populate the dev.env file with your database connection information:
```sh
NODE_ENV=development
MONGODB_LOCAL_URI=mongodb://localhost:27017/<DB name of your choice>
MONGODB_ONLINE_URI=<Add this if you intend to host this app online>
```

4. Run the app:
```sh
npm start
```
