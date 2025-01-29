
import { MailController } from '@/controllers/mail.controller';
import { Router } from 'express';


export class MailRouter {
  private router: Router;
  private mailController: MailController;

  constructor() {
    this.mailController = new MailController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/invoice/:id', this.mailController.SendInvoiceMail.bind(this.mailController));
    this.router.get("/verify-email", this.mailController.VerifyEmail.bind(this.mailController));
  }

  getRouter(): Router {
    return this.router;
  }
}
