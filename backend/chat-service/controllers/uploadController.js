const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const axios = require('axios');

exports.downloadFile = async (req, res) => {
  try {
    const { fileUrl, filename } = req.query;

    if (!fileUrl) {
      return res.status(400).json({ message: 'fileUrl is required' });
    }

    const response = await axios.get(fileUrl, {
      responseType: 'stream'
    });

    let downloadFilename = filename || 'download';
    
    if (!downloadFilename.includes('.')) {
      const urlMatch = fileUrl.match(/\.([a-zA-Z0-9]+)(\?|$)/);
      if (urlMatch) {
        downloadFilename = `${downloadFilename}.${urlMatch[1]}`;
      }
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadFilename)}"; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');

    response.data.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message || 'Upload failed' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          return res.status(500).json({ 
            message: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.' 
          });
        }

        const isImage = req.file.mimetype.startsWith('image/');
        const fileType = isImage ? 'image' : 'file';

        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        const uploadOptions = {
          resource_type: isImage ? 'image' : 'auto',
          folder: 'chat-app',
          use_filename: true,
          unique_filename: true,
        };

        const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

        res.json({
          success: true,
          file: {
            url: result.secure_url,
            publicId: result.public_id,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: result.bytes || req.file.size,
            type: fileType
          }
        });

      } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ message: 'Failed to upload to Cloudinary: ' + error.message });
      }
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
