import { Models } from '@models';
import { Services } from '@services';
import { Request, Response, Router } from 'express';
import { checkJwt } from '../middlewares/checkJwt';

export class DataRouter {
  router: Router;
  entityName: string;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const entityName: any = req.params.entity;

      const data = await Services.Data.getList(entityName);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const entityName: any = req.params.entity;

      const data = await Services.Data.getById(entityName, parseInt(id));
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async deleteItem(req: Request, res: Response, next) {
    try {
      const id = req.params['id'];
      const entity: any = req.params.entity;
      const data = await Services.Data.delete(entity, parseInt(id));
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async updateItem(req: Request, res: Response, next) {
    try {
      const body = req.body;
      const entity: any = req.params.entity;
      const item = body.item;
      const data = await Services.Data.update(entity, item.Id, item);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  public async createItem(req: Request, res: Response, next) {
    try {
      const body = req.body;
      const entity: any = req.params.entity;
      const userId = res.locals.jwtPayload.userId;

      const item = body.item;
      item.UserId = userId;
      const data = await Services.Data.save(entity, item);
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.post('/:entity/list(/:lang?)', this.getList.bind(this));
    this.router.post('/:entity/item/:id/:lang?', [checkJwt], this.getById.bind(this));
    this.router.delete('/:entity/:id', [checkJwt], this.deleteItem.bind(this));
    this.router.patch('/:entity', [checkJwt], this.updateItem.bind(this));
    this.router.post('/:entity', [checkJwt], this.createItem.bind(this));
  }
}
