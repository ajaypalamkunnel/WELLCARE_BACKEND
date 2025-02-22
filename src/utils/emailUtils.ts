import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

console.log("===>",process.env.SMTP_USER);
console.log("===>",process.env.SMTP_PASS);

export const sendOTPEmail = async (email: string, otp: string) => {
    try {
        const mailOptions = {
            from: `"WellCare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your OTP Code from WellCare",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f4f4f4;">
                <div style="max-width: 420px; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15); border-top: 5px solid #03C03C;">
                <h2 style="color: #03C03C; font-size: 24px; margin-bottom: 10px;">WellCare Health Services</h2>
                <p style="font-size: 18px; color: #444;">Your One-Time Password (OTP)</p>
                <h1 style="font-size: 36px; color: #03C03C; margin: 15px 0; letter-spacing: 2px;">${otp}</h1>
                <p style="font-size: 16px; color: #666;">Use this OTP to verify your account. It is valid for <strong>10 minutes</strong>.</p>
                <p style="font-size: 14px; color: #999; margin-top: 20px;">If you didn't request this OTP, please ignore this email.</p>
                 </div>
                 </div>

            `
        };
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.error("Error sending email:", error);
        
    }
}