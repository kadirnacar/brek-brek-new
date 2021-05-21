import { Invite, InviteStatus } from '@models';
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

  public async postInvite(req: Request, res: Response, next) {
    try {
      const data = req.body;
      let inviteId: string;
      if (data.id && data.refId) {
        const invite = await this.inviteRepo.save({
          id: new ObjectId(),
          refId: data.refId,
          userId: data.id,
          name: data.name,
        });
        inviteId = invite.id.toHexString();
      }
      res.status(200).send({ inviteId });
    } catch (err) {
      next(err);
    }
  }

  public async deleteInvite(req: Request, res: Response, next) {
    try {
      const data = req.body;
      if (data.id) {
        await this.inviteRepo.delete(this.inviteRepo.getById(new ObjectId(data.id)));
      }
      res.status(200).send({});
    } catch (err) {
      next(err);
    }
  }

  public async getInvite(req: Request, res: Response, next) {
    try {
      const data = req.body;
      let invite: Invite;
      if (data && data.id) {
        invite = this.inviteRepo.getById(new ObjectId(data.id));

        if (invite && invite.status != InviteStatus.Accepted && invite.userId != data.userId) {
          const expireDate = new Date(invite.createDate);
          expireDate.setDate(expireDate.getDate() + 1);
          if (expireDate > new Date()) {
            await this.inviteRepo.update(invite.id, {
              iName: data.name,
              iRefId: data.refId,
              iUserId: data.userId,
              status: InviteStatus.Accepted,
            });
          } else {
            await this.inviteRepo.delete(invite);
            res.status(200).send({
              success: false,
              message: 'Davetiye süresi doldu',
            });
            return;
          }
          res.status(200).send({
            id: invite.userId,
            name: invite.name,
            refId: invite.iRefId,
          });
        } else {
          res.status(200).send({});
        }
      } else {
        res.status(200).send({});
      }
    } catch (err) {
      next(err);
    }
  }

  public async getList(req: Request, res: Response, next) {
    try {
      const data = req.body;
      if (data && data.invites) {
        const invites = this.inviteRepo
          .getAll()
          .filter((x) => data.invites.indexOf(x.id.toHexString()) > -1);
        const returnData = invites.map((x) => ({
          id: x.id.toHexString(),
          name: x.iName,
          userId: x.iUserId,
          refId: x.iRefId,
        }));

        for (let index = 0; index < invites.length; index++) {
          const invite = invites[index];
          this.inviteRepo.delete(invite);
        }

        res.status(200).send({
          data: returnData,
        });
      } else {
        res.status(200).send({ data: [] });
      }
    } catch (err) {
      next(err);
    }
  }

  async init() {
    this.inviteRepo = new RealmService<Invite>('Invite');
    this.router.post('/', this.postInvite.bind(this));
    this.router.delete('/', this.deleteInvite.bind(this));
    this.router.post('/accept', this.getInvite.bind(this));
    this.router.post('/list', this.getList.bind(this));
  }
}
