const path = require("path");
const express = require("express");
const app = express();
const morgan = require("morgan");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//Environment variables
const API = process.env.API;
const PORT = process.env.PORT;
const MONGO_DB = process.env.MONGO_DB;

//Routes
const productRoutes = require("./router/product");

//middlewares
app.use(express.json((express.urlencoded = false)));
app.use(morgan("tiny"));
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
    "/uploads/images",
    express.static(path.join(__dirname, "uploads/images"))
);
app.use(`${API}`, productRoutes);

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
