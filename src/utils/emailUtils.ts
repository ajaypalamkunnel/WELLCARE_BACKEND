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


export const sendApplicationRejectionEmail = async (email: string, reason: string) => {
    try {
        const mailOptions = {
            from: `"WellCare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Doctor Application - Action Required",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f4f4f4;">
                    <div style="max-width: 480px; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15); border-top: 5px solid #d9534f;">
                        <h2 style="color: #d9534f; font-size: 24px; margin-bottom: 10px;">WellCare Health Services</h2>
                        <p style="font-size: 18px; color: #444;">Important Update on Your Application</p>
                        <p style="font-size: 16px; color: #666;">Dear Doctor,</p>
                        <p style="font-size: 16px; color: #666;">After reviewing your application, we regret to inform you that it has been <strong style="color: #d9534f;">rejected</strong> due to the following reason:</p>
                        <p style="font-size: 16px; color: #d9534f; font-weight: bold;">"${reason}"</p>
                        <p style="font-size: 16px; color: #666;">We encourage you to <strong>review your application</strong> and submit a new request with the necessary corrections.</p>
                        <p style="font-size: 16px; color: #666;">If you have any questions, feel free to reach out to our support team.</p>
                        <p style="font-size: 14px; color: #999; margin-top: 20px;">Best Regards,<br>WellCare Team</p>
                    </div>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending rejection email:", error);
    }
};


export const sendApplicationApprovalEmail = async (email: string) => {
    try {
        const mailOptions = {
            from: `"WellCare" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Doctor Application Has Been Approved 🎉",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f4f4f4;">
                    <div style="max-width: 480px; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.15); border-top: 5px solid #03C03C;">
                        <h2 style="color: #03C03C; font-size: 24px; margin-bottom: 10px;">WellCare Health Services</h2>
                        <p style="font-size: 18px; color: #444;">🎉 Congratulations, Doctor!</p>
                        <p style="font-size: 16px; color: #666;">We are pleased to inform you that your application has been <strong style="color: #03C03C;">successfully approved!</strong></p>
                        <p style="font-size: 16px; color: #666;">You are now officially a part of the WellCare network, and you can start providing your services on our platform.</p>
                        <p style="font-size: 16px; color: #666;">Log in to your account and set up your profile to begin your journey with us.</p>
                        <p style="font-size: 16px; color: #666;"><strong>Welcome aboard! 🚀</strong></p>
                        <p style="font-size: 14px; color: #999; margin-top: 20px;">Best Regards,<br>WellCare Team</p>
                    </div>
                </div>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending approval email:", error);
    }
};
