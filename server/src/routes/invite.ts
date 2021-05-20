import { Invite } from '@models';
import { RealmService } from '../realm/RealmService';
import { Services } from '@services';
import { Request, Response, Router } from 'express';
import { ObjectId } from 'bson';

export class InviteRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }
  inviteRepo: RealmService<Invite>;
  public async getList(req: Request, res: Response, next) {
    try {
      const data = req.params;
      if (data.inviteId && data.inviteId.split('.')[0] && data.refId && data.userId) {
        const hasData = this.inviteRepo
          .getAll()
          .find(
            (x) =>
              x.inviteId == data.inviteId.split('.')[0] &&
              x.refId == data.refId &&
              x.userId == data.userId
          );
        if (!hasData) {
          this.inviteRepo.save({
            id: new ObjectId(),
            inviteId: data.inviteId.split('.')[0],
            refId: data.refId,
            userId: data.userId,
          });
        }
      }
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.inviteRepo = new RealmService<Invite>('Invite');
    this.router.get('/:userId/:refId/:inviteId', this.getList.bind(this));
  }
}
