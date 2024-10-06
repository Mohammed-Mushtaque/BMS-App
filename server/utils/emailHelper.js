const nodemailer = require("nodemailer");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
console.log(process.env.USER);
function replaceContent(content, creds) {
   const allKeysArr = Object.keys(creds);
  allKeysArr.forEach(function (key) {
    content = content.replace(`#{${key}}`, creds[key]);
  });
  return content;
}

async function EmailHelper(templateName, receiverEmail, creds) {
  //console.log("i am inside email helper")
  try {
    const templatePath = path.join(__dirname, "email_templates", templateName);
    let content = await fs.promises.readFile(templatePath, "utf-8");
    const emailDetails = {
      to: receiverEmail,
      from:{
        name:"bookmyshow",
        address:process.env.USER,
      },
      subject: "Mail from BOOK MY SHOW",
      text: `Hi ${creds.name}, this is your reset OTP: ${creds.otp}`,
      html: replaceContent(content, creds),
    };
    const transportDetails = {
      
      service:'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.USER, // use environment variables for sensitive information
        pass: process.env.PASSWORD
      },
      tls: { rejectUnauthorized: false }
    };
    const transporter = nodemailer.createTransport(transportDetails);
    await transporter.sendMail(emailDetails);
    console.log("Email sent successfully");
  } catch (err) {
    console.log("Error sending email:", err);
  }
}

module.exports = EmailHelper;