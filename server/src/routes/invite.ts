import { Invite, InviteStatus } from '@models';
import { RealmService } from '../realm/RealmService';
import { InviteService, Services } from '@services';
import { Request, Response, Router } from 'express';
import { ObjectId } from 'bson';

export class InviteRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async postInvite(req: Request, res: Response, next) {
    try {
      const data = req.body;
      let inviteId: string;
      if (data.id && data.refId) {
        const invite = await InviteService.save({
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
        await InviteService.delete(data.id);
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
        invite = InviteService.get(data.id);

        if (invite && invite.status != InviteStatus.Accepted && invite.userId != data.userId) {
          const expireDate = new Date(invite.createDate);
          expireDate.setDate(expireDate.getDate() + 1);
          if (expireDate > new Date()) {
            await InviteService.update({
              id: invite.id,
              iName: data.name,
              iRefId: data.refId,
              iUserId: data.userId,
              status: InviteStatus.Accepted,
            });
          } else {
            await InviteService.delete(invite.id);
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
        const invites = InviteService.getInvites().filter(
          (x) => data.invites.indexOf(x.id.toHexString()) > -1
        );
        const returnData = invites.map((x) => ({
          id: x.id.toHexString(),
          name: x.iName,
          userId: x.iUserId,
          refId: x.iRefId,
        }));

        for (let index = 0; index < invites.length; index++) {
          const invite = invites[index];
          await InviteService.delete(invite.id);
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
    this.router.post('/', this.postInvite.bind(this));
    this.router.delete('/', this.deleteInvite.bind(this));
    this.router.post('/accept', this.getInvite.bind(this));
    this.router.post('/list', this.getList.bind(this));
  }
}
