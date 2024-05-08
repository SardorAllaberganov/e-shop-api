// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// module.exports = (req, res, next) => {
//     let token = req.headers["authorization"];
//     if (!token) {
//         return res
//             .status(401)
//             .json({ message: "Access Denied. No token provided." });
//     }
//     token = token.split(" ")[1];
//     try {
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decodedToken;
//         if (!decodedToken) {
//             return res.status(401).json({ message: "Not authorized." });
//         }
//         next();
//     } catch (error) {
//         return res.status(400).json({ message: "Invalid token." });
//     }
// };

// const { expressjwt: jwt } = require("express-jwt");
// const secret = process.env.JWT_SECRET;
// const API = process.env.API;

// module.exports = () => {
//     return jwt({ secret, algorithms: ["HS256"] }).unless({
//         path: [
//             { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] },
//             `${API}/users/login`,
//             `${API}/users/register`,
//         ],
//     });
// };
