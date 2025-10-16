import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // console.log("Email transporter created:", {
    //     host: process.env.EMAIL_HOST,
    //     port: process.env.EMAIL_PORT,
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD
    // });

    // Define the email options
    const mailOptions = {
        from: "Cinema Booking App <AbsoluteCinema@Kino.io> ",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html || undefined, // Optional HTML content
    }

    // Send the email via nodemailer
    await transporter.sendMail(mailOptions)
}
