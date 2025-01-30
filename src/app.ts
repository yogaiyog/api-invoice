import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
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
    this.app.use(cors({
      origin: ['https://invoice-app-alpha-orcin.vercel.app', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }));

    // Middleware lainnya
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));

    // Menangani preflight request (OPTIONS)
    this.app.options('*', (req: Request, res: Response) => {
      res.header('Access-Control-Allow-Origin', 'https://invoice-app-alpha-orcin.vercel.app');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.sendStatus(200);
    });

    // Tambahkan header CORS pada setiap response
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', 'https://invoice-app-alpha-orcin.vercel.app');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
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
    const productRouter = new ProductRouter();
    const userRouter = new UserRouter();
    const clientRouter = new ClientRouter();
    const invoiceRouter = new InvoiceRouter();
    const invoiceItemRouter = new InvoiceItemRouter();
    const mailRouter = new MailRouter();

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
