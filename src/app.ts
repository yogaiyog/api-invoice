import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import '@/helpers/cron';
import { ProductRouter } from './routers/product.router';
import { ClientRouter } from './routers/client.router';
import { InvoiceRouter } from './routers/invoice.router';
import { InvoiceItemRouter } from './routers/invoiceItems.router';
import { UserRouter } from './routers/user.router';
import { MailRouter } from './routers/mail.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const productRouter = new ProductRouter()
    const userRouter = new UserRouter()
    const clientRouter = new ClientRouter()
    const invoiceRouter = new InvoiceRouter()
    const invoiceItemRouter = new InvoiceItemRouter()
    const mailRouter = new MailRouter()

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });

    this.app.use('/api/product', productRouter.getRouter());
    this.app.use('/api/user', userRouter.getRouter());
    this.app.use('/api/client', clientRouter.getRouter());
    this.app.use('/api/invoice', invoiceRouter.getRouter());
    this.app.use('/api/invoice-items', invoiceItemRouter.getRouter());
    this.app.use('/api/mail', mailRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
