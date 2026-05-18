import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    let transporter;
    let senderEmail;

    // Check if real email credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      senderEmail = process.env.EMAIL_USER;
    } else {
      // Fallback: Create a fake testing account automatically
      console.log('----------------------------------------------------');
      console.log('No email credentials found. Generating a fake test email account...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });
      senderEmail = testAccount.user;
    }

    // Define the email options
    const mailOptions = {
      from: `Finance Tracker AI <${senderEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.htmlMessage || `<p>${options.message}</p>`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // If using the fake account, print the URL where the user can view the email in their browser
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`✅ TEST EMAIL SENT TO: ${options.email}`);
      console.log('🔗 You can view this fake email in your browser by clicking the link below:');
      console.log(nodemailer.getTestMessageUrl(info));
      console.log('----------------------------------------------------');
    } else {
      console.log(`Email sent: ${info.messageId}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export default sendEmail;
