import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { verifyToken } from '@/middlewares/token';

export class ProductRouter {
  private router: Router;
  private productController: ProductController;

  constructor() {
    this.productController = new ProductController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.productController.getAllProducts.bind(this.productController));
    
    this.router.get('/:id', this.productController.getProductById.bind(this.productController));

    this.router.get('/:id/userId', this.productController.getProductByUser.bind(this.productController))
    
    this.router.post('/', this.productController.createProduct.bind(this.productController));
    
    this.router.put('/:id',verifyToken, this.productController.updateProduct.bind(this.productController));
    
    this.router.delete('/:id', this.productController.deleteProduct.bind(this.productController));
  }

  getRouter(): Router {
    return this.router;
  }
}
