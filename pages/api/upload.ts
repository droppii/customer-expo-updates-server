import { IncomingForm } from 'formidable';
import { promises as fs, mkdirSync, createReadStream, unlinkSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import unzip from 'unzipper';
// first we need to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    // parse form with a Promise wrapper
    const data: any = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    const version = req.headers['version-string'];

    try {
      const imageFile = data.files.files[0];

      const imagePath = imageFile.filepath;
      const timestampInSeconds = parseInt(imageFile.originalFilename.split('.')[0], 10);
      const folderVersionString = `updates/${version}`;
      mkdirSync(folderVersionString, { recursive: true });
      // const folder = `updates/${version}/${timestampInSeconds}`;
      const pathToWriteZip = `updates/${version}/${timestampInSeconds}.zip`;
      // mkdirSync(folder, { recursive: true });
      const image = await fs.readFile(imagePath);

      await fs.writeFile(pathToWriteZip, image);
      createReadStream(pathToWriteZip)
        .pipe(unzip.Extract({ path: `updates/${version}/` }))
        .on('close', () => {
          // Delete the uploaded zip file after extraction
          unlinkSync(pathToWriteZip);
          res.status(200).json({ message: 'File uploaded and extracted successfully' });
        })
        .on('error', (err) => {
          res.status(500).json({ error: `Error extracting file: ${err.message}` });
        });

      //store path in DB
      res.status(200).json({ message: 'file uploaded!' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
      return;
    }
  }
};
