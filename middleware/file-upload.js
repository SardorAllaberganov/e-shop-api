const multer = require("multer");

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.fieldname === "image") {
			cb(null, "uploads/images/");
		} else if (file.fieldname === "images") {
			cb(null, "uploads/images/");
		}
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
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

const uploads = multer({ storage: fileStorage, fileFilter: fileFilter });

module.exports = uploads;
