
  export const sendOtpTemplate =(email , otp)=> `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"></head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 40px;">
                        <tr><td style="text-align: center; padding-bottom: 20px;"><h2 style="color: #333333; margin: 0;">Verification Code</h2></td></tr>
                        <tr><td style="color: #555555; font-size: 16px; line-height: 1.5; padding-bottom: 20px;">Hi <strong>${email}</strong>,<p>Use the code below to complete your verification. This code is valid for 10 minutes.</p></td></tr>
                        <tr><td align="center" style="padding: 20px 0;"><div style="background-color: #f0f2f5; color: #1d4ed8; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; border-radius: 6px; display: inline-block;">${otp}</div></td></tr>
                        <tr><td style="color: #888888; font-size: 14px; line-height: 1.4; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center;">If you didn't request this, you can safely ignore this email.</td></tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `