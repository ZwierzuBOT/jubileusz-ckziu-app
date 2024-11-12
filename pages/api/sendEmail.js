import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      uploadDir: path.join('/tmp'), // Use Vercel's temp directory
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files: { attachments: files.attachments } });
      }
    });
  });
};

const deleteTempFiles = (files) => {
  files.forEach((file) => {
    const filePath = file.filepath;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${filePath}`, err);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  });
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { fields, files } = await parseForm(req);

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

      const attachments = Array.isArray(files.attachments)
        ? files.attachments
        : [files.attachments];

      attachments.forEach((file) => {
        mailOptions.attachments.push({
          filename: file.originalFilename || 'unknown',
          path: file.filepath,  // Use the temporary file path
        });
      });

      await transporter.sendMail(mailOptions);
      deleteTempFiles(attachments);

      res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
