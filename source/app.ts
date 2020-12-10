import express from 'express';
import morgan from 'morgan';
import getVersionRouter from './api/router';
import bodyParser from 'body-parser';
import databaseHelper from './helpers/database.helper';

export default class App {

    public app: express.Application
    private port: number;
  

    constructor() {
        this.app = express();
        this.port = this.normalizePort(process.env.PORT);

        this.start();
    }

    private async start(): Promise<void> {
        await databaseHelper.connect();
        console.log('Database connected');

        this.middleware();
        this.routes();

        this.app.listen(this.port);
        console.log(`Server listening on port ${this.port}`);
    }

    private normalizePort(val: string | number | undefined, fallback = 3000) : number {
        if (typeof val === 'string') {
            const port = parseInt(val, 10);
            if (!isNaN(port) && port > 0)
                return port;
        } else if (typeof val === 'number' && val > 0) {
            return val;
        }
        return fallback;
    }

    private middleware() {
        this.app.use(bodyParser.json());
        this.app.use(morgan('dev'));
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
        });
    }
    
    private routes() {
        this.app.get('/', (req, res) => { res.send('Hello world!'); });
        this.app.use('/api', getVersionRouter());
    }

}