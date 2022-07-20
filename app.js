/**
 * Node modules.
 */
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");

/**
 * Utils import.
 */
const connectDB = require("./utils/connectDB");
const ServerError = require("./utils/ServerError");

/**
 * Connecting to database.
 */
connectDB(process.env.MONGODB_URI);

/**
 * Configs import
 */
const { sessionConfig } = require("./configs/config");

/**
 * Declarations.
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Router imports.
 */
const FileRouter = require("./routes/file/file.router");
const FileRouterV2 = require("./routes/v2/file/file.router.v2");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(session(sessionConfig));
app.use(flash());
/**
 * Setting global variables
 */
 app.use(async (req, res, next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/**
 * Routes middleware.
 */
app.use('/', FileRouter);
/**
 * Routes middleware v2
 */
app.use('/api/v2', FileRouterV2);

/**
 * Home route.
 */
app.route("/").get((req, res) => {
    res.render("home", {
        message : null,
        fileLink: null
    });
});

/**
 * If none of the routes matches.
 */
app.all('*', (req, res, next)=>{
    next(new ServerError('Page Not Found', 404));
})

/**
 * Default error handling middleware.
 */
app.use((err, req, res, next)=>{
    const { status=500, message="Something went wrong", stack } = err;
    res.status(status).send({err, message, stack});
})

/**
 * Method to start the server.
 */

module.exports = app ;