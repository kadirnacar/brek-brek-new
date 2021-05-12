import { NextFunction, Request, Response, Router } from 'express';
import * as multer from 'multer';
import { checkJwt } from '../middlewares/checkJwt';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },

  filename: function (req: any, file: any, cb: any) {
    const { originalname } = file;
    const fileExtension = (originalname.match(/\.+[\S]+$/) || [])[0];
    cb(null, `${file.fieldname}${Date.now()}${fileExtension}`);
    // cb(null, file.originalname);
  },
});
const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Image uploaded is not of type jpg/jpeg or png'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

export class FileRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async upload(req: Request, res: Response, next: NextFunction) {
    const token = <string>req.headers['auth'];

    try {
      res.status(200).send(req['files'].map((x) => x.path));
    } catch (error) {
      res.status(200).send(false);
    }
  }

  async init() {
    this.router.post('/upload', [checkJwt, upload.array('images', 5)], this.upload.bind(this));
  }
}
