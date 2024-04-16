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
app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.multipart())
app.use(morgan("dev"));
// const formData = require("express-form-data");
// app.use(formData.parse());

app.use(`${API}`, productRoutes);
app.use(`${API}/categories`, categoryRoutes);

app.use(
    "/uploads/images",
    express.static(path.join(__dirname, "uploads/images"))
);

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
        console.log(err);
    });

//Global error handler middleware
app.use((err, req, res, next) => {
    if (err) {
        return res.status(err.statusCode || 500).json({
            statusCode: err.statusCode,
            message: err.message,
            data: err.data,
        });
    }
});
