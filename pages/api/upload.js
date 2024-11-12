import { IncomingForm } from 'formidable';
import { blob } from '@vercel/blob';
import nodemailer from 'nodemailer';
import fs from 'fs';

// Configure the transporter for nodemailer (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Function to upload file to Vercel Blob Storage
const uploadToBlob = async (filePath, fileName) => {
  const fileStream = fs.createReadStream(filePath);

  try {
    // Upload file to Vercel Blob Storage
    const { url } = await blob.upload(fileStream, {
      path: `uploads/${fileName}`,
      contentType: 'application/octet-stream',
    });
    return url; // Return the file URL from Blob Storage
  } catch (error) {
    throw new Error('Error uploading file to Vercel Blob');
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable body parsing so we can handle it manually with formidable
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing files' });
      }

      try {
        const file = files.file[0];
        const fileUrl = await uploadToBlob(file.filepath, file.originalFilename);

        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: 'zwierzchowski.mateo@gmail.com',
          subject: 'Nowy załącznik',
          text: 'A new file has been uploaded.',
          html: `<p>A new file has been uploaded. You can access it <a href="${fileUrl}">here</a>.</p>`,
        };

        transporter.sendMail(mailOptions, (emailErr, info) => {
          if (emailErr) {
            return res.status(500).json({ message: 'Error sending email' });
          }
          res.status(200).json({ message: 'File uploaded and email sent', fileUrl });
        });
      } catch (uploadErr) {
        res.status(500).json({ message: 'Error uploading file to Vercel Blob', error: uploadErr });
      }
    });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
