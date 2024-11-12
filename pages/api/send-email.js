import nodemailer from 'nodemailer';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing form:", err);
        return res.status(500).json({ message: 'Failed to parse form' });
      }

      const { name, surname, schoolName, parentName } = fields;
      const uploadedFiles = files['attachments'];

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const attachments = Array.isArray(uploadedFiles) ? uploadedFiles.map(file => ({
        filename: file.originalFilename,
        content: file.filepath,
      })) : [{
        filename: uploadedFiles.originalFilename,
        content: uploadedFiles.filepath,
      }];

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'zwierzchowski.mateo@gmail.com',
        subject: 'New Form Submission with Files',
        text: `Name: ${name}\nSurname: ${surname}\nSchool: ${schoolName}\nParent: ${parentName}\n\nFiles are attached.`,
        attachments,
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