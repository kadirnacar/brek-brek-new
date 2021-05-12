import { MailTemplate, Settings } from "@models";
import * as Mailgen from "mailgen";
import * as nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import config from "../config";
import { SettingsService } from "./SettingsService";

const settingsService = new SettingsService();

export class MailServiceClass {
  constructor() {
    const settings = settingsService.getSettings();
    if (settings && settings.length > 0) {
      try {
        this.settings = settings[0];
        this.transporter = nodemailer.createTransport(settings[0].MailSettings);
      } catch {}
    }
    this.MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: this.settings?.MailTemplate?.header,
        link: "#",
      },
    });
  }
  transporter: Mail;
  MailGenerator: Mailgen;
  settings: Settings;

  public async sendMail(userEmail, name, res) {
    let buff = Buffer.from(userEmail);
    let base64data = buff.toString("base64");
    let response = {
      body: {
        name,
        intro: this.settings?.MailTemplate?.bodyHeader,
        action: {
          instructions: this.settings?.MailTemplate?.bodyButtonText,
          button: {
            color: "#22BC66", // Optional action button color
            text: "Validate",
            link: this.settings?.MailTemplate?.bodyButtonLink + base64data,
          },
        },
      },
    };

    let mail = this.MailGenerator.generate(response);

    let message = {
      from: this.settings?.MailTemplate?.from,
      to: userEmail,
      subject: this.settings?.MailTemplate?.subject,
      html: mail,
    };

    try {
      await this.transporter.sendMail(message);
      res.status(200).send({ message: "you should receive an email from us" });
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  }
}
// export const MailService: MailServiceClass = new MailServiceClass();
