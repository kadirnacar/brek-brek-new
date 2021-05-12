export class Settings {
  CarouselImages?: MainCarouselImages[];
  MailSettings?: MailSettings;
  MailTemplate?: MailTemplate;
}

export class MainCarouselImages {
  url?: string;
}

export class MailSettings {
  service?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
}

export class MailTemplate {
  header?: string;
  from?: string;
  subject?: string;
  bodyHeader?: string;
  bodyButtonText?: string;
  bodyButtonLink?: string;
}
