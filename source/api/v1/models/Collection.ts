import joi from 'joi';
import { DBObject } from './misc.models';

export interface Word {
    id: number;
    index: number;
    original: string;
    translation: string;
    languageFrom: string | undefined;
    languageTo: string | undefined;
}

export interface Collection {
    _id?: string,
    index: number;
    name: string;
    description: string;
    owner: string;
    languageFrom: string | undefined;
    languageTo: string | undefined;
    words: Word[];
}

export interface DBCollectionDoc extends Collection, DBObject {
}

export function validateWord(word: unknown): { value?: Word, error?: string } {
    const validationResult = joi.object({
        id: joi.number().integer().min(0).required(),
        index: joi.number().integer().min(0).required(),
        original: joi.string().required(),
        translation: joi.string().required(),
        languageFrom: joi.string().length(2),
        languageTo: joi.string().length(2)
    }).validate(word);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    return { value: (word as Word) };
}

export function validateCollection(collection: unknown): { value?: Collection, error?: string } {
    const validationResult = joi.object({
        _id: joi.string(),
        index: joi.number().integer().min(0).required(),
        name: joi.string().required(),
        description: joi.string().required(),
        owner: joi.string().required(),
        languageFrom: joi.string().length(2),
        languageTo: joi.string().length(2),
        words: joi.array()
    }).validate(collection);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    const err = (collection as Collection).words.map(w => validateWord(w).error).find(e => e !== undefined);
    if (err) {
        return { error: err };
    } else if ((collection as Collection).words.some(w1 => (collection as Collection).words.find(w2 => w1.id === w2.id))) {
        return { error: 'Duplicate word id' };
    }

    return { value: (collection as Collection) };
}

export function getCollectionFromDBDoc(doc: DBCollectionDoc): Collection {
    return {
        _id: doc._id,
        index: doc.index,
        name: doc.name,
        description: doc.description,
        owner: doc.owner,
        languageFrom: doc.languageFrom,
        languageTo: doc.languageTo,
        words: doc.words.map(w => {
            return {
                id: w.id,
                index: w.index,
                original: w.original,
                translation: w.translation,
                languageFrom: w.languageFrom,
                languageTo: w.languageTo
            };
        })
    };
}

export function createDBCollectionDoc(collection: Collection): DBCollectionDoc {
    return {
        createdOn: new Date(),
        lastModified: new Date(),
        index: collection.index,
        name: collection.name,
        description: collection.description,
        owner: collection.owner,
        languageFrom: collection.languageFrom,
        languageTo: collection.languageTo,
        words: collection.words.map(w => {
            return {
                id: w.id,
                index: w.index,
                original: w.original,
                translation: w.translation,
                languageFrom: w.languageFrom,
                languageTo: w.languageTo
            };
        }).sort(w => w.index).map((w, i) => {
            w.index = i;
            return w;
        })
    };
}