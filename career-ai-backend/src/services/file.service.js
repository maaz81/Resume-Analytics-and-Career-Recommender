import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

/**
 * Save file and return metadata
 */
export const saveFile = async (file) => {
    try {
        const id = uuidv4();
        const dest = path.join(UPLOAD_DIR, id + path.extname(file.originalname));

        fs.renameSync(file.path, dest);

        return {
            id,
            name: file.originalname,
            path: dest,
            size: file.size,
            type: file.mimetype,
            url: `/uploads/${id}`
        };
    } catch (err) {
        logger.error('File save failed', { error: err });
        throw new Error('Failed to save file');
    }
};

/**
 * Delete file from disk
 */
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info('File deleted', { filePath });
        }
    } catch (err) {
        logger.error('File delete failed', { filePath, error: err });
    }
};