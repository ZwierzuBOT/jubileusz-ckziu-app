import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import formidable, { Files, Fields } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ParsedForm {
  fields: Fields;
  files: {
    attachments: Files;
  };
}

const parseForm = (req: any): Promise<ParsedForm> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), '/tmp'),
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

const deleteTempFiles = (files: { filepath: string }[]) => {
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

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      const { fields, files } = await parseForm(req);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'zwierzchowski.mateo@gmail.com',
          pass: 'rmhy oihb upwo hbam',
        },
      });

      const mailOptions = {
        from: 'zwierzchowski.mateo@gmail.com',
        to: 'zwierzchowski.mateo@gmail.com',
        subject: `Załącznik przesłany od ${fields.name} ${fields.surname}`,
        text: `Imię: ${fields.name}\nNazwisko: ${fields.surname}\nSzkoła: ${fields.schoolName}\nOpiekun Szkolny: ${fields.parentName}`,
        attachments: [],
      };

      if (files.attachments) {
        const filesArray = Array.isArray(files.attachments) ? files.attachments : [files.attachments];
        filesArray.forEach((file: any) => {
          mailOptions.attachments.push({
            filename: file.originalFilename,
            path: file.filepath,
          });
        });
      }

      await transporter.sendMail(mailOptions);
      deleteTempFiles(Array.isArray(files.attachments) ? files.attachments : [files.attachments]);

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
