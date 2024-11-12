import nodemailer from 'nodemailer';
import formidable from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, 
  },
};

const parseForm = (req: any) => {
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

const handler = async (req: any, res: any) => {
  if (req.method === 'POST') {
    try {
      console.log('Received request method: POST');
      console.log('Start parsing the form...');

      const { fields, files } = await parseForm(req);

      console.log('Form parsed successfully');
      console.log('Fields:', fields);
      console.log('Files:', files);

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
        subject: `Application from ${fields.name} ${fields.surname}`, 
        text: `School: ${fields.schoolName}\nGuardian: ${fields.parentName}`, 
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
