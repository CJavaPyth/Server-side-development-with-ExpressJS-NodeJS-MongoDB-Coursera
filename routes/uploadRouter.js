const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({       //configuration 
    destination: (req, file, cb) => {           //destination is configured as a function, and the func takes req, file, and a callback func
        cb(null, 'public/images');          //callback func takes in 2 params, first one is the err(which is null) and 2nd is the destination folder where the images are going to be stored
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)     //if not multer will give a random string with no extensions
    }
                                            
});


const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/))                    //specifies which kind of files i am willing to upload
    {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true)
};          

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();  //declares dishRouter as an ExpressRouter
uploadRouter.use(bodyParser.json());

uploadRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('GET operation not supported on /imageUpload');   //req.body will give access to whatever is inside the body of the msg
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req,res) => {         //upload.single means only one single file can be uploaded, upload.single will take care of any errors if there are any
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);             //pass back req.file object from server back to client
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('PUT operation not supported on /imageUpload')   //req.body will give access to whatever is inside the body of the msg
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403; //403 means operation not supported 
    res.end('DELETE operation not supported on /imageUpload')   //req.body will give access to whatever is inside the body of the msg
})

module.exports = uploadRouter;