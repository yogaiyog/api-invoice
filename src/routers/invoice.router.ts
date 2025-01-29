import { InvoiceController } from '@/controllers/invoice.controller';
import { Router } from 'express';


export class InvoiceRouter {
  private router: Router;
  private invoiceController: InvoiceController;

  constructor() {
    this.invoiceController = new InvoiceController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    
    this.router.get('/:id', this.invoiceController.getInvoiceById.bind(this.invoiceController));

    this.router.get('/:userId/userId', this.invoiceController.getAllInvoices.bind(this.invoiceController))
    
    this.router.post('/', this.invoiceController.createInvoice.bind(this.invoiceController));
    
    this.router.put('/:id', this.invoiceController.updateInvoice.bind(this.invoiceController));
    
    this.router.delete('/:id', this.invoiceController.deleteInvoice.bind(this.invoiceController));

    this.router.get('/:userId/stats', this.invoiceController.getInvoiceStats.bind(this.invoiceController))
  }

  getRouter(): Router {
    return this.router;
  }
}
