const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");

const API = process.env.API;
const PORT = process.env.PORT;
const MONGO_DB = process.env.MONGO_DB;

//Router
const productRoutes = require("./router/product");

//middlewares
app.use(express.json((express.urlencoded = false)));
app.use(morgan("tiny"));
app.use(`${API}`, productRoutes);

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
