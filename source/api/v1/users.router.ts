import * as express from 'express';

function login(req: express.Request, res: express.Response) {
    res.send('Hello world from users!');
}


export default function(): express.Router {
    const router = express.Router();
    router.get('/login', login);

    return router;
}