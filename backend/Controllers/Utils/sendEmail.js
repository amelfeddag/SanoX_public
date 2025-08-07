import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email templates
const emailTemplates = {
  confirmation: 'confirmationEmail.html',
  deletion: 'deletionEmail.html',
  successdeletion: 'successDeletionEmail.html',
  OTPverify: 'OTPverifyEmail.html',
  resetPassword: 'resetPasswordEmail.html',
  updateVerification: 'updateVerifEmail.html'
};

const emailObjects = {
  confirmation: 'Email Confirmation - SanoX',
  deletion: 'Account Deletion Request - SanoX',
  successdeletion: 'Account Deleted - SanoX',
  OTPverify: 'Email Verification Code - SanoX',
  resetPassword: 'Reset Password - SanoX',
  updateVerification: 'Update Verification - SanoX'
};

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sendEmail = async (email, token, type) => {
  try {
    console.log(`Sending ${type} email to:`, email);
    
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const emailTemplateFile = emailTemplates[type];
    const emailObject = emailObjects[type];

    
    const emailTemplatePath = path.join(__dirname, '../Emails', emailTemplateFile);
    
   
    if (!fs.existsSync(emailTemplatePath)) {
      throw new Error(`Email template not found: ${emailTemplatePath}`);
    }
    
    const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');
    let emailHtml = emailTemplate;
    
   
    switch (type) {
      case 'confirmation':
        //hna update link
        emailHtml = emailTemplate.replace(
          'verification_link', 
          `${process.env.FRONTEND_URL || 'https://your-sanox-frontend.com'}/auth/verify-email/${token}`
        );
        break;
        
      case 'OTPverify':
        emailHtml = emailTemplate.replace('{{otp}}', token);
        break;
        
      case 'resetPassword':
        //update link
        emailHtml = emailTemplate.replace(
          'reset_link', 
          `${process.env.FRONTEND_URL || 'https://your-sanox-frontend.com'}/auth/reset-password/${token}`
        );
        break;
        
      case 'updateVerification':
        //update mail path
        emailHtml = emailTemplate.replace(
          'verification_link', 
          `${process.env.BACKEND_URL || 'https://your-sanox-backend.com'}/api/profile/update-email/verify/${token}`
        );
        break;
        
      case 'deletion':
      case 'successdeletion':
        break;
        
      default:
        console.warn(`Unknown email type: ${type}`);
    }

    const mailOptions = {
      from: `SanoX Medical Platform <${process.env.EMAIL_USER}>`,
      to: email,
      subject: emailObject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`${type} email sent successfully to ${email}:`, result.messageId);
    
    return result;

  } catch (error) {
    console.error(`Error sending ${type} email to ${email}:`, error);
    throw new Error(`Failed to send ${type} email: ${error.message}`);
  }
};

export default sendEmail;