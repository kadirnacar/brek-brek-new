import { User } from '@models';
import { Services } from '@services';
import * as bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import config from '../config';
import { checkJwt } from '../middlewares/checkJwt';

const UserService = Services.User;

export class AuthRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      let { email, password, type } = req.body;
      if (!(email && password)) {
        res.status(400).send({});
        return;
      }

      let user: User;
      try {
        user = await UserService.getUser(email);
      } catch (error) {
        res.status(401).send(error);
        return;
      }
      if (!user) {
        res.status(401).send({ message: 'User not found!' });
        return;
      }
      // if (!user.IsValidated) {
      //   res
      //     .status(401)
      //     .send({ message: "User not validated. Plase check your email!" });
      //   return;
      // }
      // if (!user.IsAccepted && user.Type == "Agency") {
      //   res.status(401).send({
      //     message: "Your account not accepted yet. Plase contact helpdesk",
      //   });
      //   return;
      // }
      var checkPassword = await UserService.checkIfUnencryptedPasswordIsValid(
        user.Password,
        password
      );
      if (!checkPassword) {
        // if (!AuthService.checkIfUnencryptedPasswordIsValid(user.password, password)) {
        res.status(401).send({
          message: 'User not authanticated. Please check your name and password!',
        });
        return;
      }

      const token = jwt.sign({ userId: user.id, email: user.Email }, config.jwtSecret, {
        expiresIn: '20000 days',
      });

      res.send({
        token,
        userId: user.id,
        name: user.Name,
        image: user.Image,
        email: user.Email,
      });
    } catch (err) {
      next(err);
    }
  }

  public async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = res.locals.jwtPayload.userId;

      const { oldPassword, newPassword } = req.body;
      if (!(oldPassword && newPassword)) {
        res.status(400).send();
      }

      let user: User;
      try {
        user = UserService.getById(id);
      } catch (id) {
        res.status(401).send();
      }

      var checkPassword = await UserService.checkIfUnencryptedPasswordIsValid(
        user.Password,
        oldPassword
      );
      if (!checkPassword) {
        res.status(401).send();
        return;
      }

      user.Password = newPassword;
      // const errors = await validate(user);
      // if (errors.length > 0) {
      //     res.status(400).send(errors);
      //     return;
      // }
      //Hash the new password and save
      user.Password = bcrypt.hashSync(user.Password, 8);
      await UserService.update(id, user);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  public async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      var values = req.body;
      // values.id = shortid.generate();

      let { Email } = values;
      if (!Email) {
        res.status(400).send({ message: 'Enter a valid email' });
        return;
      }

      let user: User;
      try {
        user = await UserService.getUser(Email);
      } catch (error) {
        res.status(401).send(error);
        return;
      }
      if (user) {
        res.status(401).send({
          message: 'This email used before. Plase enter another mail and try again',
        });
        return;
      }

      values.Password = bcrypt.hashSync(values.Password, 8);
      values.IsValidated = true;
      await UserService.create(values);
      res.status(200).send(values.id);
    } catch (err) {
      next(err);
    }
  }

  public async validate(req: Request, res: Response, next: NextFunction) {
    try {
      var Email = req.params['id'];
      // values.id = shortid.generate();

      if (!Email) {
        res.status(400).send({ message: 'Wrong validate id' });
        return;
      }

      let buff = Buffer.from(Email, 'base64');
      let text = buff.toString('ascii');

      let user: User;
      try {
        user = await UserService.getUser(text);
      } catch (error) {
        res.status(401).send(error);
        return;
      }
      if (!user) {
        res.status(401).send({
          message: 'Email not found!',
        });
        return;
      }

      user.IsValidated = true;
      await UserService.update(user.id, user);

      const token = jwt.sign({ userId: user.id, email: user.Email }, config.jwtSecret, {
        expiresIn: '20000 days',
      });

      res.send({
        token,
        userId: user.id,
        name: user.Name,
        image: user.Image,
        email: user.Email,
      });
    } catch (err) {
      next(err);
    }
  }

  public async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      var values: any = req.query;
      const user: User = { ...new User(), ...values };
      user.IsValidated = true;
      user.Password = bcrypt.hashSync(values.Password, 8);
      user.IsAccepted = true;
      await UserService.create(user);
      res.status(200).send(null);
    } catch (err) {
      next(err);
    }
  }

  public async check(req: Request, res: Response, next: NextFunction) {
    const token = <string>req.headers['auth'];

    try {
      const jwtPayload = <any>jwt.verify(token, config.jwtSecret);
      res.status(200).send(true);
    } catch (error) {
      res.status(200).send(false);
    }
  }

  async init() {
    this.router.post('/login', this.login.bind(this));
    this.router.post('/register', this.createItem.bind(this));
    this.router.post('/validate/:id', this.validate.bind(this));
    this.router.get('/create', this.createUser.bind(this));
    this.router.post('/check', this.check.bind(this));
    this.router.post('/change-password', [checkJwt], this.changePassword.bind(this));
  }
}
