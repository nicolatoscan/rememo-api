import * as express from 'express';
import * as Models from '../models';
import * as collectionServices from '../services/collection.services';
import LANG from '../../../lang';
import { ObjectId } from 'mongodb';

// --- COLLECTIONS ---
async function getCollections(req: express.Request, res: express.Response) {
    const mine = req.params.mine;
    const classes = req.params.classes?.split(',');
    if(!mine && !classes){
        const colls = await collectionServices.getAllCollections(res.locals._id);
        return res.send(colls);
    }else if(!mine && (classes.length === 0 || classes === null)){
        const colls = await collectionServices.getCollections(res.locals._id);
        return res.send(colls);
    }else if(!classes && mine === 'false'){
        const colls = await collectionServices.getJoinedClassCollections(res.locals._id);
        return res.send(colls);
    }else if(mine === 'false' && classes.length !== 0){
        const colls = await collectionServices.getClassCollection(classes.map(c => new ObjectId(c)));
        return res.send(colls);
    }

    return res.status(404);
}

async function createCollection(req: express.Request, res: express.Response) {
    const valCollection = Models.validateCollection(req.body);
    if (valCollection.error) {
        return res.status(400).send(valCollection.error);

    } else if (valCollection.value) {
        const collection = valCollection.value;

        const { collectionId } = await collectionServices.createCollection(collection, res.locals._id);

        return res.status(201).send({ _id: collectionId });
    }
}

async function getCollectionById(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
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
    if (!idColl) {
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
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    await collectionServices.deleteCollectionById(idColl, res.locals._id);

    return res.status(204).send({ message: LANG.COLLECTION_DELETED });
}

// --- WORDS ---
async function createWord(req: express.Request, res: express.Response) {
    const idColl = req.params.idColl;
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }
    console.log(idColl);

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
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!idWord) {
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
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!idWord) {
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
    if (!idColl) {
        return res.status(404).send(LANG.COLLECTION_ID_NOT_FOUND);
    }

    const idWord = req.params.idWord;
    if (!idWord) {
        return res.status(404).send(LANG.WORD_ID_NOT_FOUND);
    }

    await collectionServices.deleteWordById(idColl, idWord, res.locals._id);

    return res.status(204).send({ message: LANG.WORD_DELETED });

}


export default function (): express.Router {
    const router = express.Router();

    router.get('/', getCollections);

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