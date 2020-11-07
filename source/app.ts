import express from 'express';
import morgan from 'morgan';
import getVersionRouter from './api/router';
import bodyParser from 'body-parser';
import databaseService from './services/database.services';

export default class App {

    public app: express.Application
    private port: number;
  

    constructor() {
        this.app = express();
        this.port = this.normalizePort(process.env.PORT);

        databaseService.connect();

        this.middleware();
        this.routes();

        this.app.listen(this.port);
        console.log(`Server listening on port ${this.port}`);
    }

    private normalizePort(val: string | number | undefined, fallback = 3000) : number {
        if (typeof val === 'string')
        {
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
    }
    
    private routes() {
        this.app.get('/', (req, res) => { res.send('Hello world!'); });
        this.app.use('/api', getVersionRouter());
    }

}