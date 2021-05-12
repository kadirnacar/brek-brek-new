import { User } from "@models";
import { Services, UserService } from "@services";
import { Router } from "express";
import { BaseRouter } from "./BaseRoute";

export class UserRouter extends BaseRouter<User> {
  router: Router;
  service: UserService;

  constructor() {
    super(Services.User);
  }
}
