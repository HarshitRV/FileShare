const app = require("./app");
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`${process.env.NODE_ENV} server is running on port ${PORT}`);
});