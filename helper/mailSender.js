const fs = require("fs");
const nodemailer = require("nodemailer");
const htmlTemplate = fs.readFileSync("./helper/index.html", "utf8");
require("dotenv").config();

exports.sendMail = (req, res, next) => {
    const email = req.body.email;
    const subject = req.body.subject;

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: process.env.MAIL_LOGIN,
            pass: process.env.MAIL_PASS,
        },
    });
    const mailOptions = {
        from: "nella.emmerich59@ethereal.email",
        to: email,
        subject: subject,
        html: htmlTemplate,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        } else {
            console.log("Email sent: ", info.response);
            return res
                .status(200)
                .json({ message: "Email sent successfully!" });
        }
    });
};
