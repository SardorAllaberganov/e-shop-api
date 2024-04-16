const fs = require("fs");
const path = require("path");

const clearImage = (filePath, callback) => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath, (error) => {
        !error ? callback(null) : callback(error);
    });
};

module.exports = clearImage;
