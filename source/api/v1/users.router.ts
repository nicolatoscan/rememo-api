import * as express from 'express';
import databaseService from '../../services/database.services';

async function getUserById(req: express.Request, res: express.Response) {
    const user = await databaseService.getCollection('users').findOne({ username: req.params.username });
    if (user) { 
        res.send(user);
    }else{
        res.status(404).send('User not found');
    }
}


export default function (): express.Router {
    const router = express.Router();
    router.get('/:username', getUserById);
    //router.put('/:username', getUserById);
    //router.delete('/:username', getUserById);
    return router;
}