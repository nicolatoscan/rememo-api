import * as express from 'express';
import databaseService from '../../../services/database.services';
import * as Models from '../models';
import bcrypt from 'bcryptjs';


async function getLoggedUser(req: express.Request, res: express.Response) {

    const user = await databaseService.getCollection('users').findOne({ username: res.locals.username }); 
    if (user) { 
        res.send(Models.getUserFromDBDoc(user));
    } else {
        res.status(404).send('User not found');
    }
}

async function deleteLoggedUser(req: express.Request, res: express.Response) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);
    } else if(valUser.value){
        if (valUser.value.username !== res.locals.username) {
            return res.status(400).send('username and logged user do not match ');
        }
        const user = (await databaseService.getCollection('users').findOne({ username: res.locals.username })) as Models.DBUserDoc; 

        if(!user || !(await bcrypt.compare(valUser.value.password, user.password))){
            return res.status(301).send('Wrong password');
        }

        await databaseService.getCollection('users').deleteOne({ username: res.locals.username });
        return res.send('User deleted');

    }
}


export default function (): express.Router {
    const router = express.Router();
    router.get('/', getLoggedUser);
    router.delete('/', deleteLoggedUser);
    
    return router;
}