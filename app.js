const homeRoutes = require('./routes/home');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const apiAuthMiddleware = require('./api-auth-middleware');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use(apiAuthMiddleware.apiAuthMiddleware);

app.use("/", (req, res, next) => {
    next();
}, homeRoutes);

app.use("/games", (req, res, next) => {
    next();
}, gamesRoutes);

app.use("/categories", (req, res, next) => {
    next();
}, categoriesRoutes);

app.use("/auth", (req, res, next) => {
    next();
}, authRoutes);

app.use("/users", (req, res, next) => {
    next();
}, usersRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

async function startApp() {
    try {
        await mongoose
            .connect(`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@gamemania.kikgazp.mongodb.net/${process.env.MONGO_DB_DEFAULT_DATABASE}?retryWrites=true&w=majority`);
        console.log("connected");
        app.listen(process.env.PORT || 8080);
    } catch (err) {
        console.log(err);
    }
}
startApp();