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
const userRoutes = require("./router/user");
const { expressjwt: jwt } = require("express-jwt");
const secret = process.env.JWT_SECRET;

// router.post("/sendMail", userController.sendMail);

//middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(
    jwt({
        secret,
        algorithms: ["HS256"],
        isRevoked: async function isRevoked(req, token) {
            if (!token.payload.user.isAdmin) {
                return true;
            }
        },
    }).unless({
        path: [
            { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
            { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
            `${API}/users/login`,
            `${API}/users/register`,
        ],
    })
);

// app.use(`${API}/sendMail`, userRoutes);

app.use(`${API}/products`, productRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/users`, userRoutes);

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
