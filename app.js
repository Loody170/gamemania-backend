const path = require('path');
const homeRoutes = require('./routes/home');
const gamesRoutes = require('./routes/games');
const categoriesRoutes = require('./routes/categories');

const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());

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


// app.use("/", homeRoutes);

const server = app.listen(8080);