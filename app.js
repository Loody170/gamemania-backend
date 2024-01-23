const path = require('path');
const homeRoutes = require('./routes/home');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
require('dotenv').config();


const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const app = express();
app.use(cors());
app.use(express.json());

app.use("/", (req, res, next) => {
    console.log(req.method);
    next();
}, homeRoutes);

app.use("/games", (req, res, next) => {
    console.log(req.method);
    next();
}, gamesRoutes);

app.use("/categories", (req, res, next) => {
    console.log(req.method);
    next();
}, categoriesRoutes);

app.use("/auth", (req, res, next) => {
    console.log(req.method);
    // console.log("req of signup is",req.body);
    console.log("going to auth routes");
    next();
}, authRoutes);

app.use("/users", (req, res, next) => {
    console.log(req.method);
    // console.log("req of signup is",req.body);
    console.log("going to users routes");
    next();
}, usersRoutes);

app.use((error, req, res, next) => {
    console.log("error is", error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log("status is", status);
    res.status(status).json({message: message, data: data});
});


// app.use("/", homeRoutes);

// const server = app.listen(8080);
async function startApp() {
    try {
        await mongoose
        .connect(`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@gamemania.kikgazp.mongodb.net/gamemania?retryWrites=true&w=majority`);
        console.log("connected");
        app.listen(8080);
    } catch (err) {
        console.log(err);
        // app.listen(8080);
    }
}
startApp();