import nodemailer from 'nodemailer';
import formidable from 'formidable';
import path from 'path';
import { Dropbox } from 'dropbox';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), '/tmp'),
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

const uploadFileToDropbox = async (file) => {
  const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  const fileContent = fs.readFileSync(file.filepath);
  const fileName = file.originalFilename || 'uploaded_file';

  const response = await dbx.filesUpload({
    path: `/${fileName}`, // Corrected this line to use template literals properly
    contents: fileContent,
  });

  const link = await dbx.sharingCreateSharedLinkWithSettings({ path: response.result.path_display });
  return link.result.url.replace('?dl=0', '?dl=1'); // Convert to direct download link
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      console.log('Received request method: POST');
      console.log('Start parsing the form...');

      const { fields, files } = await parseForm(req);

      console.log('Form parsed successfully');
      console.log('Fields:', fields);
      console.log('Files:', files);

      const fileLinks = [];
      if (files.attachments) {
        const filesArray = Array.isArray(files.attachments) ? files.attachments : [files.attachments];

        for (const file of filesArray) {
          const link = await uploadFileToDropbox(file);
          fileLinks.push(link);
        }
      }

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
        subject: `Application from ${fields.name} ${fields.surname}`, // Corrected this line to use template literals properly
        text: `School: ${fields.schoolName}\nGuardian: ${fields.parentName}\n\nLinki do załączników:\n${fileLinks.join('\n')}`, // Corrected this line to use template literals properly
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
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
