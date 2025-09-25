const { moveFile, unZip, removeFile } = require("../services/uploadService");
const path = require("path");


const uploadMultiple = async (req, res) => {
    const destBasePath = process.env.FILE_BASE_PATH
    try {
        const files = req.files;
        const fnName = req.body.fnName;
        const runtime = req.body.runtime;
        for (file of files) {
            const destPath = path.join(destBasePath, runtime, fnName, file.originalname)
            console.log(destPath)
            await moveFile(file.path, destPath)
        };

        res.status(200).json({ message: "All files moved successfully" });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
};

const uploadZip = async (req, res) => {
    const destBasePath = process.env.FILE_BASE_PATH
    try {
        const file = req.file;
        const fnName = req.body.fnName;
        const runtime = req.body.runtime;
        const destPath = path.join(destBasePath, runtime, fnName, file.originalname)
        await moveFile(file.path, destPath)

        const extractPath = path.dirname(destPath);

        // Await works now because the callback is async
        await unZip(destPath, extractPath);

        await removeFile(destPath)

        return res.status(200).json({
            message: "Zip uploaded and extracted successfully"
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadMultiple, uploadZip };
