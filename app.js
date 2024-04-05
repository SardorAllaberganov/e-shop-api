const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");

//Environment variables
const API = process.env.API;
const PORT = process.env.PORT;
const MONGO_DB = process.env.MONGO_DB;

//CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", ["*"]);
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTION"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    res.setHeader("Content-Type", "application/json");
    next();
});

//Routes
const productRoutes = require("./router/product");
const categoryRoutes = require("./router/category");

//middlewares
app.use(express.json((express.urlencoded = false)));
app.use(morgan("tiny"));

app.use(
    "/uploads/images",
    express.static(path.join(__dirname, "uploads/images"))
);
app.use(`${API}`, productRoutes);
app.use(`${API}/categories`, categoryRoutes);

//Database connection
mongoose
    .connect(MONGO_DB)
    .then(() => {
        console.log("Connected to Database");
        app.listen(PORT, () =>
            console.log(`Running in port: http://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        res.status(500).json({ message: error.message });
    });

//Global error handler middleware
app.use((err, req, res, next) => {
    if (err) {
        return res.status(err.statusCode || 500).json({
            statusCode: err.statusCode,
            message: err.message,
        });
    }
});
