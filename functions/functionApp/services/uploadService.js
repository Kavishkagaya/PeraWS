const multer = require('multer');
const path = require('path');
const fs = require('fs')
const unzipper = require('unzipper')


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

const moveFile = async (source, dest) => {
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir))
        await fs.promises.mkdir(destDir, { recursive: true })

    await fs.promises.rename(source, dest)
}

const removeFile = async (filePath)=>{
    if (!fs.existsSync(destDir))
        return {error: "no file named found"}
    await fs.promises.rm({path: filePath})
}

const unZip = async (zipPath, extractPath) => {
    await new Promise((resolve, reject) => {
        fs.createReadStream(zipPath)
            .pipe(unzipper.Parse())
            .on("entry", async (entry) => {
                // Remove first folder from path
                const parts = entry.path.split(/\/|\\/); // handle both / and \
                const strippedPath = parts.slice(1).join(path.sep);

                if (!strippedPath) {
                    entry.autodrain(); // Skip empty
                    return;
                }

                const filePath = path.join(extractPath, strippedPath);
                
                if (entry.type === "Directory") {
                    fs.mkdirSync(filePath, { recursive: true });
                    entry.autodrain();
                } else {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                    entry.pipe(fs.createWriteStream(filePath));
                }
            })
            .on("close", () => {
                resolve(`Unzipped file to ${extractPath}`)
            })
            .on("error", (err) => {
                reject(`Error when extracting: ${err}`)
            })
    })
}

module.exports = {
    upload,
    unZip,
    moveFile,
    removeFile
}