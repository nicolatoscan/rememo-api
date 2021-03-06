import * as express from 'express';
import * as Models from '../models';
import * as collectionServices from '../services/collection.services';
import * as typesHelper from '../../../helpers/types.helper';
import LANG from '../../../lang';

// --- COLLECTIONS ---
async function getCollectionsFull(req: express.Request, res: express.Response) {
    await getCollections(req, res, false);
}

async function getCollectionsMin(req: express.Request, res: express.Response) {
    await getCollections(req, res, true);
}

async function getCollections(req: express.Request, res: express.Response, minified = false) {
    let mine: boolean | undefined = undefined;
    if (req.query.mine === 'true')
        mine = true;
    else if (req.query.mine === 'false')
        mine = false;

    let classes: string[] | null = null;
    if (typeof req.query.classes === 'string') {
        classes = req.query.classes.split(',');
    }

    let type: Models.EClassOwnershipType;
    if (mine === true && classes) {
        type = Models.EClassOwnershipType.Both;
    } else if (mine === true && !classes) {
        type = Models.EClassOwnershipType.Created;
    } else if (mine === false) {
        type = Models.EClassOwnershipType.Joined;
    } else if (mine === undefined && classes) {
        type = Models.EClassOwnershipType.Joined;
    } else if (mine === undefined && !classes) {
        type = Models.EClassOwnershipType.Both;
    } else {
        return res.status(400).send(LANG.ERROR_PARAMS_PARSE);
    }

    const colls = await collectionServices.getCollections(minified, res.locals._id, type, classes);
    return res.send(colls);
}



async function createCollection(req: express.Request, res: express.Response) {
    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);

    } else if (valCollection.value) {
        const collection = valCollection.value;

        const { collectionId } = await collectionServices.createCollection(collection, res.locals._id);

        return res.status(201).send({ _id: collectionId});
    }
}

async function getCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const collection = await collectionServices.getCollectionById(idColl, res.locals._id);

    if (!collection) {
        return res.status(404).send(LANG.COLLECTION_NOT_FOUND);
    } else {
        return res.send(collection);
    }
}

async function updateCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);

    } else if (valCollection.value) {
        const collection: any = valCollection.value;
        delete collection._id;
        delete collection.owner;
        delete collection.words;

        await collectionServices.updateCollectionById(idColl, res.locals._id, collection);

        return res.status(204).send({ message: LANG.COLLECTION_UPDATED });
    }

}

async function deleteCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await collectionServices.deleteCollectionById(idColl, res.locals._id);

    return res.status(204).send({ message: LANG.COLLECTION_DELETED });
}

// --- WORDS ---
async function createWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);
    } else if (valWord.value) {
        const word = valWord.value;

        const { wordId } = await collectionServices.createWord(word, idColl, res.locals._id);

        return res.status(201).send({ _id: wordId });
    }
}

async function getWordById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!typesHelper.checkId(idWord)) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    const word = await collectionServices.getWordById(idColl, idWord, res.locals._id);

    if (!word) {
        return res.status(404).send(LANG.WORD_NOT_FOUND);
    } else {
        return res.send(word);
    }

}

async function updateWordById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!typesHelper.checkId(idWord)) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    const valWord = Models.validateWord(req.body);
    if (valWord.error) {
        return res.status(400).send(valWord.error);

    } else if (valWord.value) {
        const word = valWord.value;

        await collectionServices.updateWordById(idColl, idWord, res.locals._id, word);

        return res.status(204).send({ message: LANG.WORD_UPDATED });
    }

}

async function deleteWordById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!typesHelper.checkId(idColl)) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!typesHelper.checkId(idWord)) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    await collectionServices.deleteWordById(idColl, idWord, res.locals._id);

    return res.status(204).send({ message: LANG.WORD_DELETED });

}


export default function (): express.Router {
    const router = express.Router();

    router.get('/', getCollectionsFull);
    router.get('/min', getCollectionsMin);

    router.post('/', createCollection);
    router.get('/:idColl', getCollectionById);
    router.put('/:idColl', updateCollectionById);
    router.delete('/:idColl', deleteCollectionById);

    router.post('/:idColl/words', createWord);
    router.get('/:idColl/words/:idWord', getWordById);
    router.put('/:idColl/words/:idWord', updateWordById);
    router.delete('/:idColl/words/:idWord', deleteWordById);

    return router;
}