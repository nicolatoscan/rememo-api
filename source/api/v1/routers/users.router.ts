import * as express from 'express';
import * as Models from '../models';
import * as userServices from '../services/user.services';
import LANG from '../../../lang';


async function getLoggedUser(req: express.Request, res: express.Response) {
    const user = await userServices.getUserById(res.locals._id);

    if (user) {
        res.send(user);
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

        const result = await userServices.deleteUserById(res.locals._id, valUser.value.password);

        if (!result)
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        else
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

        const result = await userServices.updateUserById(res.locals._id, valUser.value.password, valUser.value);

        if (!result)
            return res.status(301).send(LANG.AUTH_WRONG_CREDENTIAL);
        else
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