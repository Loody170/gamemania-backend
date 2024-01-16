const path = require('path');
const homeRoutes = require('./routes/home');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');


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

app.use((error, req, res, next) => {
    console.log("error is", error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});


// app.use("/", homeRoutes);

// const server = app.listen(8080);
async function startApp() {
    try {
        await mongoose.connect("mongodb+srv://loody:BjZx6z8BFGbYGDQe@gamemania.kikgazp.mongodb.net/gamemania?retryWrites=true&w=majority");
        console.log("connected");
        app.listen(8080);
    } catch (err) {
        console.log(err);
    }
}
startApp();