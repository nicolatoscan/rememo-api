import * as express from 'express';
import * as Models from '../models';
import databaseService from '../../../services/database.services';
import bcrypt from 'bcryptjs';
import LANG from '../../../lang';


async function getLoggedUser(req: express.Request, res: express.Response) {

    const user = await databaseService.getCollection('users').findOne({ username: res.locals.username });
    if (user) {
        res.send(Models.getUserFromDBDoc(user));
    } else {
        res.status(404).send(LANG.USER_NOT_FOUND);
    }
}

async function deleteLoggedUser(req: express.Request, res: express.Response) {
    const valUser = Models.validateLoginUser(req.body);
    if (valUser.error) {
        return res.status(400).send(valUser.error);
    } else if (valUser.value) {
        //check username
        if (valUser.value.username !== res.locals.username) {
            return res.status(400).send(LANG.AUTH_USER_DOES_NOT_MATCH);
        }

        //check password
        const user = (await databaseService.getCollection('users').findOne({ username: res.locals.username })) as Models.DBUserDoc;
        if (!user || !(await bcrypt.compare(valUser.value.password, user.password))) {
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        }

        //delete
        await databaseService.getCollection('users').deleteOne({ username: res.locals.username });
        return res.send(LANG.USER_DELETED);

    }
}

async function updateLoggedUser(req: express.Request, res: express.Response) {
    const valUser = Models.validateUpdateUser(req.body);

    if (valUser.error) {
        return res.status(400).send(valUser.error);
    } else if (valUser.value) {

        //check username
        if (valUser.value.username !== res.locals.username) {
            return res.status(400).send(LANG.AUTH_USER_DOES_NOT_MATCH);
        }

        //check password
        const user = (await databaseService.getCollection('users').findOne({ username: res.locals.username })) as Models.DBUserDoc;
        if (!user || !(await bcrypt.compare(valUser.value.password, user.password))) {
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        }

        //update
        if (valUser.value.displayName) {
            await databaseService.getCollection('users').updateOne({ username: valUser.value.username }, { $set: { displayName: valUser.value.displayName } });
        }
        if (valUser.value.email) {
            await databaseService.getCollection('users').updateOne({ username: valUser.value.username }, { $set: { email: valUser.value.email } });
        }
        if (valUser.value.newPassword) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(valUser.value.newPassword, salt);
            await databaseService.getCollection('users').updateOne({ username: valUser.value.username }, { $set: { password: hashedPassword } });
        }
        return res.send(LANG.USER_UPDATED);
    }

}


export default function (): express.Router {
    const router = express.Router();

    router.get('/', getLoggedUser);
    router.delete('/', deleteLoggedUser);
    router.put('/', updateLoggedUser);

    return router;
}