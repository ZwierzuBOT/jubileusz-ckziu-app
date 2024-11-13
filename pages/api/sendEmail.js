import nodemailer from 'nodemailer';
import { Dropbox } from 'dropbox';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    bodyParser: false,
  },
};

const readStreamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

const uploadFileToDropbox = async (buffer, fileName) => {
  const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  const response = await dbx.filesUpload({
    path: `/${fileName}`,
    contents: buffer,
  });

  const link = await dbx.sharingCreateSharedLinkWithSettings({
    path: response.result.path_display,
  });

  return link.result.url.replace('?dl=0', '?dl=1');
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      console.log('Received POST request');

      const formData = new URLSearchParams();
      const parts = req.headers['content-type'].split('boundary=');
      if (parts.length === 2) {
        const boundary = '--' + parts[1];
        const buffers = await readStreamToBuffer(req);
        const sections = buffers.toString().split(boundary).filter((section) => section.includes('Content-Disposition'));

        let name, surname, schoolName, parentName, fileBuffer, fileName;

        for (const section of sections) {
          const headersEnd = section.indexOf('\r\n\r\n');
          const headers = section.slice(0, headersEnd).toString();
          const content = section.slice(headersEnd + 4, section.length - 2);

          if (headers.includes('name="name"')) name = content.toString().trim();
          else if (headers.includes('name="surname"')) surname = content.toString().trim();
          else if (headers.includes('name="schoolName"')) schoolName = content.toString().trim();
          else if (headers.includes('name="parentName"')) parentName = content.toString().trim();
          else if (headers.includes('filename="')) {
            const fileHeader = headers.match(/filename="(.+?)"/);
            fileName = fileHeader ? fileHeader[1] : 'uploaded_file';
            fileBuffer = Buffer.from(content);
          }
        }

        const fileLink = await uploadFileToDropbox(fileBuffer, fileName);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: 'zwierzchowski.mateo@gmail.com',
          subject: `Nowy plik wysłany od ${name} ${surname}`,
          text: `Szkoła: ${schoolName}\nImię Opiekuna Szkolnego: ${parentName}\n\nLink do plików:\n${fileLink}`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully!', link: fileLink });
      } else {
        throw new Error('Multipart boundary not found');
      }
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Error in handler', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
