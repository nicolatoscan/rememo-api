import * as express from 'express';
import databaseService from '../../../services/database.services';
import * as Models from '../models';
import { User } from '../models';

async function getUserById(req: express.Request, res: express.Response) {
    
    const user = await databaseService.getCollection('users').findOne({ username: res.locals.username }); 
    if (user) { 
        res.send(Models.getUserFromDBDoc(user));
    } else {
        res.status(404).send('User not found');
    }
}


async function deleteUser(req: express.Request, res: express.Response){
    const a =  await databaseService.getCollection('users').deleteOne({ 'username' : req.body.username });

    console.log(a);
}

export default function (): express.Router {
    const router = express.Router();
    router.get('/', getUserById);
    
    router.delete('/delete/:username', deleteUser);
    return router;
}