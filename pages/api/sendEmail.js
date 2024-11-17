import formidable from 'formidable';
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true, 
      multiples: true, 
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { fields, files } = await parseForm(req);


      const attachments = [];
      if (files.attachments) {
        const uploadedFiles = Array.isArray(files.attachments)
          ? files.attachments
          : [files.attachments];

        uploadedFiles.forEach((file) => {
          attachments.push({
            filename: file.originalFilename, 
            path: file.filepath,
          });
        });
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
        subject: `Application from ${fields.name} ${fields.surname}`,
        text: `Szkoła: ${fields.schoolName}\nImię opiekuna szkolnego: ${fields.parentName}`,
        attachments, 
      };

      await transporter.sendMail(mailOptions);

      console.log('Email sent successfully');
      res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ message: 'Error sending email', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
