import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import multer from 'multer';

export const config = {
  api: {
    bodyParser: false,  // Disable the default body parser for file uploads
  },
};

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store the uploaded files in a temporary directory
    cb(null, path.join(process.cwd(), '/tmp'));
  },
  filename: function (req, file, cb) {
    // Use the original filename
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const handler = async (req, res) => {
  if (req.method === 'POST') {
    // Use the multer middleware to handle the file upload
    upload.array('attachments')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading files', error: err.message });
      }

      try {
        const { fields } = req.body;  // Assuming you have other form fields in req.body

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: 'zwierzchowski.mateo@gmail.com',
          to: 'zwierzchowski.mateo@gmail.com',
          subject: `Załącznik przesłany od ${fields.name} ${fields.surname}`,
          text: `Imię: ${fields.name}\nNazwisko: ${fields.surname}\nSzkoła: ${fields.schoolName}\nOpiekun Szkolny: ${fields.parentName}`,
          attachments: [],
        };

        const attachments = Array.isArray(req.files) ? req.files : [req.files];
        
        attachments.forEach((file) => {
          mailOptions.attachments.push({
            filename: file.originalname,
            path: file.path,  
          });
        });

        await transporter.sendMail(mailOptions);

        attachments.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) {
              console.error(`Failed to delete file: ${file.path}`, err);
            } else {
              console.log(`Deleted file: ${file.path}`);
            }
          });
        });

        res.status(200).json({ message: 'Email sent successfully!' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email', error: error.message });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
