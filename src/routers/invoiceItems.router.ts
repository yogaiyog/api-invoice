import { InvoiceItemController } from '@/controllers/invoiceItem.controller';
import { Router } from 'express';

export class InvoiceItemRouter {
  private router: Router;
  private invoiceItemController: InvoiceItemController;

  constructor() {
    this.invoiceItemController = new InvoiceItemController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.invoiceItemController.getAllInvoiceItems.bind(this.invoiceItemController));

    this.router.get('/:id', this.invoiceItemController.getInvoiceItemById.bind(this.invoiceItemController));

    this.router.post('/', this.invoiceItemController.createInvoiceItem.bind(this.invoiceItemController));

    this.router.post('/bulk', this.invoiceItemController.createManyInvoiceItems.bind(this.invoiceItemController));

    this.router.put('/:id', this.invoiceItemController.updateInvoiceItem.bind(this.invoiceItemController));

    this.router.delete('/:id', this.invoiceItemController.deleteInvoiceItem.bind(this.invoiceItemController));
  }

  getRouter(): Router {
    return this.router;
  }
}
