import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';


export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.userController.getUsers.bind(this.userController));
    
    this.router.get('/:id', this.userController.getUserById.bind(this.userController));

    this.router.post('/login', this.userController.loginUser.bind(this.userController))
    
    this.router.post('/register', this.userController.createUser.bind(this.userController));
    
    this.router.put('/:id', this.userController.updateUser.bind(this.userController));
    
    this.router.delete('/:id', this.userController.deleteUser.bind(this.userController));
  }

  getRouter(): Router {
    return this.router;
  }
}
