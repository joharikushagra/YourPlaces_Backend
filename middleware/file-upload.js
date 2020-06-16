const multer = require('multer');
const {v4:uuidv4} = require('uuid')

const MIME_TYPE_MAP = {
    'image/png' : 'png',   //mime type tell which kind of file to be dealt with
    'image/jpeg':'jpeg',//mime type tell which kind of file to be dealt with
    'image/jpg':'jpg'//mime type tell which kind of file to be dealt with
}

const fileUpload = multer({
    limits:500000, //bytes
    storage:multer.diskStorage({
        destination: (req,file,cb)=>{
           cb(null,'uploads/images');
        },
        filename:(req,file,cb)=>{
           const ext = MIME_TYPE_MAP[file.mimetype];
           cb(null,uuidv4()+'.'+ext);
        }
    }),
    fileFilter: (req,file,cb)=>{
        const isValid = !!MIME_TYPE_MAP[file.mimetype];
        let error = isValid ? null : new Error('Invalid mime Type!');
        cb(error,isValid);
    }
}) //group of middlewares

module.exports = fileUpload;