import nodemailer from 'nodemailer';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser to handle the file upload manually
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    
    // Handle file upload in memory
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: 'Failed to parse form' });
      }

      const { name, surname, schoolName, parentName } = fields;
      const uploadedFiles = files['attachments']; // File input name (attachments) should match the one in your frontend

      // Create the Nodemailer transport
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Change this to your preferred email service
        auth: {
          user: process.env.EMAIL_USER,  // Use the email from .env.local
        pass: process.env.EMAIL_PASS,  // Use the app password from .env.local
        },
      });

      // Prepare the email options with attachments from form
      const attachments = Array.isArray(uploadedFiles) ? uploadedFiles.map(file => ({
        filename: file.originalFilename,
        content: file.filepath, // Path to the temporary file stored in memory
      })) : [{
        filename: uploadedFiles.originalFilename,
        content: uploadedFiles.filepath,
      }];

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'zwierzchowski.mateo@gmail.com',
        subject: 'New Form Submission with Files',
        text: `Name: ${name}\nSurname: ${surname}\nSchool: ${schoolName}\nParent: ${parentName}\n\nFiles are attached.`,
        attachments, // Attach the files to the email
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
