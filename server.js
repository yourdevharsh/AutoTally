import http from 'node:http';
import express from 'express';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import upload from './helpers/multer.js';
import gemResult from './helpers/gemini.js';

const app = express();

app.use(express.static(path.join(process.cwd(), 'public')));

app.use(express.urlencoded({
    extended: true
}));


app.post('/process-bills', upload.array('photos', 100), async (req, res) => {
    console.log('working')
    try {
        const {
            fields
        } = req.body;
        const files = req.files;

        console.log(files)

        if (!files || files.length === 0) {
            return res.status(400).json({
                error: 'No images were uploaded.'
            });
        }
        if (!fields || fields.trim().length === 0) {
            return res.status(400).json({
                error: 'No fields were specified for extraction.'
            });
        }

        console.log(`Processing ${files.length} images for fields: ${fields}`);

        // Process all uploaded images in parallel
        const processingPromises = files.map(file => gemResult(file.path, fields));
        const jsonDataArray = await Promise.all(processingPromises);

        // Filter out any potential null results from failed API calls
        const validData = jsonDataArray.filter(data => data);

        if (validData.length === 0) {
            return res.status(500).json({
                error: 'Failed to extract data from any of the images.'
            });
        }

        // --- Create Excel Sheet ---
        const worksheet = xlsx.utils.json_to_sheet(validData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Extracted Data');

        // Generate a buffer from the workbook
        const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        });

        // --- Send Excel File to Client ---
        const fileName = `AutoTally-Export-${Date.now()}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(excelBuffer);

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            error: 'An internal server error occurred.'
        });
    } finally {
        // Cleanup: Delete uploaded files after processing
        if (req.files) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Failed to delete file: ${file.path}`, err);
                });
            });
        }
    }
});

const server = http.createServer(app);
const PORT = 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});