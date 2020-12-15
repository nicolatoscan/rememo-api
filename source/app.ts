import express from 'express';
import morgan from 'morgan';
import getVersionRouter from './api/router';
import bodyParser from 'body-parser';
import databaseHelper from './helpers/database.helper';
import * as typesHelper from './helpers/types.helper';
import * as path from 'path';

function normalizePort(val: string | number | undefined, fallback = 3000): number {
    if (typeof val === 'string') {
        const port = parseInt(val, 10);
        if (!isNaN(port) && port > 0)
            return port;
    } else if (typeof val === 'number' && val > 0) {
        return val;
    }
    return fallback;
}

async function start(app: express.Application): Promise<void> {
    const port = normalizePort(process.env.PORT);
    await databaseHelper.connect();
    console.log('Database connected');

    middleware(app);
    routes(app);

    const server = app.listen(port);
    console.log(`Server listening on port ${port}`);
    process.on('SIGINT', () => {
        console.log('Killing the server');
        databaseHelper.closeConnection();
        console.log('Connection closed');
        server.close();
        process.exit();
    });
}

function middleware(app: express.Application) {
    app.use(bodyParser.json());
    if (!process.env.PROD)
        app.use((req, res, next) => morgan('dev')(req, res, next));
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', '*');
        next();
    });
    app.use((req, res, next) => {
        if (req.body)
            typesHelper.trimValues(req.body);
        if (req.params)
            typesHelper.trimValues(req.params);
        if (req.query)
            typesHelper.trimValues(req.query);
        next();
    });
}

function routes(app: express.Application) {
    app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../../public/index.html')); });
    app.get('/app', (req, res) => { res.status(301).redirect('https://rememo.nicolatoscan.dev/'); });
    app.get('/doc', (req, res) => { res.status(301).redirect('https://rememoapi.docs.apiary.io/'); });
    app.use('/api', getVersionRouter());
}


export default function() {
    const app = express();
    start(app);
}