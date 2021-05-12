import { Services } from "@services";
import { Request, Response, Router } from "express";

export class SettingsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const data = Services.Settings.getSettings();
      res.status(200).send(data);
    } catch (err) {
      next(err);
    }
  }


  public async updateItem(req: Request, res: Response, next) {
    try {
      const values = { ...req.body?.item };
      const data = Services.Settings.save(values);
      res.status(200).send(values.item);
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.router.get("/", this.getList.bind(this));
    this.router.patch("/", this.updateItem.bind(this));
  }
}
