import ShaderService from '../services/shader';
import { Request, Response, Router } from 'express';
import { Shader } from '../models/Shader';
import { uuidv4 } from '../../tools';
import { RealmService } from '../realm/RealmService';

export class ShaderRouter {
  router: Router;
  shaderService: ShaderService;
  realm: RealmService<Shader>;

  constructor() {
    this.shaderService = new ShaderService();
    this.realm = new RealmService<Shader>(Shader);
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      //   const data = this.shaderService.allT<Shader>();
      const data = this.realm.getAll();
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const data = this.realm.getById(id.toString());
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async deleteItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const item = this.realm.getById(id);
      this.realm.delete(item);
      res.status(200).send({ status: 'success' });
    } catch (err) {
      next(err);
    }
  }

  public async createItem(req: Request, res: Response, next) {
    try {
      const values = { ...req.body };
      values.id = uuidv4();
      this.realm.save(values);
      res.status(200).send(this.realm.getAll());
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.get('/list', this.getList.bind(this));
    this.router.get('/item/:id', this.getItem.bind(this));
    this.router.delete('/:id', this.deleteItem.bind(this));
    this.router.post('/', this.createItem.bind(this));
  }
}
