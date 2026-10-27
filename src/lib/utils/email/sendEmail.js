import nodemailer from "nodemailer";
import { APP_NAME, MAILER_EMAIL, MAILER_PASSKEY } from "../../../config.js";

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
service:"gmail",
    auth: {
    user: MAILER_EMAIL,
    pass: MAILER_PASSKEY,
  },
});

export const sendEmail =async({ to , subject , html,cc,bcc,text,attachments=[]})=>{
    try {
        const info = await transporter.sendMail({
          from:`${APP_NAME} <${MAILER_EMAIL}>`, // sender address
          to, // list of recipients
          subject, // subject line
          html, // HTML body
          attachments,
          bcc,
          cc,
          text
        });
      
        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      } catch (err) {
        console.error("Error while sending mail:", err);
      }
}
