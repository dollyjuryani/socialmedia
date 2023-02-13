const nodemailer=require("nodemailer");

exports.sendemail = async(options) => {

    const transporter= nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "01652bf3af4178",
            pass: "d55defa18f43d3"
        }
    });

    const mailOptions = {
        from:"a",
        to:options.email,
        subject:options.subject,
        text:options.message
    };

    await transporter.sendMail(mailOptions);

};