import nodemailer from "nodemailer";

const sendEmail = async (subject, message, to) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Course Payment" <${process.env.ADMIN_EMAIL}>`,
      to,
      subject,
      text: message,
    });

    console.log("📧 Email sent to admin");
  } catch (error) {
    console.error("❌ Error sending email", error);
  }
};

export default sendEmail;
