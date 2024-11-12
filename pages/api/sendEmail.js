import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import formidable from 'formidable';
import { BlobStorage } from '@vercel/blob';  // Correct import

export const config = {
  api: {
    bodyParser: false,  // Disable body parser to handle file uploads manually
  },
};

// Vercel Blob client
const blobClient = new BlobStorage({
  token: process.env.BLOB_READ_WRITE_TOKEN,  // Vercel Blob read-write token
  projectId: process.env.VERCEL_PROJECT_ID,  // Vercel Project ID
});

// Parse form data using formidable
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      uploadDir: path.join(process.cwd(), '/tmp'), // Temporarily saving files before uploading to Blob
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

// Function to upload files to Vercel Blob
const uploadToBlob = async (file) => {
  const filePath = file.filepath;
  const fileStream = fs.createReadStream(filePath);

  // Upload the file to Blob storage
  const blob = await blobClient.upload(fileStream, {
    name: file.originalFilename,
    contentType: file.mimetype,
  });

  // Return the URL of the uploaded file
  return blob.url;
};

// Function to delete temporary files after email is sent
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

      // Upload files to Blob Storage
      const attachments = Array.isArray(files.attachments)
        ? files.attachments
        : [files.attachments];

      const attachmentUrls = await Promise.all(
        attachments.map(async (file) => {
          const fileUrl = await uploadToBlob(file);
          return { filename: file.originalFilename, url: fileUrl };
        })
      );

      // Create email transport with nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,  // Ensure your email is stored in Vercel's environment variables
          pass: process.env.EMAIL_PASS,  // Or use OAuth credentials securely
        },
      });

      const mailOptions = {
        from: 'zwierzchowski.mateo@gmail.com',
        to: 'zwierzchowski.mateo@gmail.com',
        subject: `Załącznik przesłany od ${fields.name} ${fields.surname}`,
        text: `Imię: ${fields.name}\nNazwisko: ${fields.surname}\nSzkoła: ${fields.schoolName}\nOpiekun Szkolny: ${fields.parentName}`,
        attachments: attachmentUrls.map((file) => ({
          filename: file.filename,
          path: file.url,  // Using the URL of the file in Blob Storage
        })),
      };

      // Send email with attachments from Blob Storage
      await transporter.sendMail(mailOptions);

      // Clean up the temporary files
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
