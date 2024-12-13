const nodemailer = require('nodemailer');
 
 
async function sendMail(to ,username, password) {
  console.log(to,username, password)
  const transporter =  nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'fxjastro@gmail.com',
            pass: 'otsw qpyr uiud cjfu'
        }
    })
    const mailOptions = {
      from: 'fxjastro@gmail.com',
      to: to,
      subject: 'Welcome to Jastrobot!',
      text: `Hi ${username},\n\nWelcome to Jastrobot!\n\nWe're excited to have you join our community. Here are your login details:\n\nEmail: ${to}\nPassword: ${password}\n\nExplore our platform and take full advantage of all the tools and features available to you. If you have any questions, feel free to reach out to our support team.\n\nHappy Trading!\n\nThe Jastrobot Team\nhttps://jastrobot.com`
  };
  
 
    try {
      const result = await transporter.sendMail(mailOptions);
    //   console.log(result);
     
      console.log('Email sent successfully');
    } catch (error) {
        console.log('Email sent error:',error)
    }
 
 
}
 
// sendMail()
module.exports = sendMail;