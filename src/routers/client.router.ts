import { ClientController } from '@/controllers/client.controller';
import { verifyToken } from '@/middlewares/token';
import { Router } from 'express';


export class ClientRouter {
  private router: Router;
  private clientController: ClientController;

  constructor() {
    this.clientController = new ClientController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.clientController.getAllClient.bind(this.clientController));
    
    this.router.get('/:id', verifyToken, this.clientController.getClienttById.bind(this.clientController));

    this.router.get('/:userId/userId',verifyToken, this.clientController.getClientByUser.bind(this.clientController))
    
    this.router.post('/', verifyToken, this.clientController.createClient.bind(this.clientController));
    
    this.router.put('/:id',verifyToken, this.clientController.updateClient.bind(this.clientController));
    
    this.router.delete('/:id', this.clientController.deleteClient.bind(this.clientController));

    this.router.post('/search', this.clientController.searchClientByName.bind(this.clientController));
  }

  getRouter(): Router {
    return this.router;
  }
}
