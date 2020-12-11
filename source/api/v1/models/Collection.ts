import joi from 'joi';
import { ObjectId } from 'mongodb';
import { DBObject } from './misc.models';

// --- INTERFACES ---
export interface Word {
    _id?: string | ObjectId;
    index: number;
    original: string;
    translation: string;
    languageFrom?: string;
    languageTo?: string;
}

export interface FullWord extends Word {
    collectionId: string | ObjectId;
}

export interface Collection {
    _id?: string,
    index: number;
    name: string;
    description: string;
    owner?: string;
    languageFrom?: string;
    languageTo?: string;
    share?:boolean;
    words: Word[];
}

export interface DBCollectionDoc extends Collection, DBObject {
}

// --- VAlIDATORS ---
export function validateWord(word: unknown, idRequired = false): { value?: Word, error?: string } {
    const validationResult = joi.object({
        _id: idRequired ? joi.string().required() : joi.string(),
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

export function validateCollection(collection: unknown, idRequired = false): { value?: Collection, error?: string } {
    const validationResult = joi.object({
        _id: idRequired ? joi.string().required() : joi.string(),
        index: joi.number().integer().min(0).required(),
        name: joi.string().required(),
        description: joi.string().required(),
        owner: joi.string(),
        languageFrom: joi.string().length(2),
        languageTo: joi.string().length(2),
        share: joi.boolean(),
        words: joi.array()
    }).validate(collection);

    if (validationResult.error) {
        return { error: validationResult.error.message };
    }

    const err = (collection as Collection).words.map(w => validateWord(w).error).find(e => e !== undefined);
    if (err) {
        return { error: err };
    }

    return { value: (collection as Collection) };
}

// --- DB parsers ---
export function getCollectionFromDBDoc(doc: DBCollectionDoc): Collection {
    return {
        _id: doc._id,
        index: doc.index,
        name: doc.name,
        description: doc.description,
        owner: doc.owner,
        languageFrom: doc.languageFrom,
        languageTo: doc.languageTo,
        share: doc.share ? true : false,
        words: doc.words.map(w => {
            return {
                _id: w._id?.toString(),
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
        share: collection.share ? true : false,
        words: collection.words.map(w => {
            return {
                _id: w._id ? w._id : new ObjectId(),
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