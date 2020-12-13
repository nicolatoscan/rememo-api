import express from 'express';
import morgan from 'morgan';
import getVersionRouter from './api/router';
import bodyParser from 'body-parser';
import databaseHelper from './helpers/database.helper';
import * as path from 'path';

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

    private normalizePort(val: string | number | undefined, fallback = 3000): number {
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
        this.app.use((req, res, next) => morgan('dev')(req, res, next));
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', '*');
            next();
        });
    }

    private routes() {
        this.app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../../public/index.html')); });
        this.app.get('/app', (req, res) => { res.status(301).redirect('https://rememo.nicolatoscan.dev/'); });
        this.app.get('/doc', (req, res) => { res.status(301).redirect('https://rememoapi.docs.apiary.io/'); });
        this.app.use('/api', getVersionRouter());
    }

}