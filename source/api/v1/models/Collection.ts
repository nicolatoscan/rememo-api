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

export function validateCollection(collection: Collection): { value?: Collection, error?: string } {
    const validationResult = joi.object({
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

    const err = collection.words.map(w => validateWord(w).error).find(e => e !== undefined);
    if (err) {
        return { error: err };
    }

    return { value: (collection as Collection) };
}

export function getCollectionFromDBDoc(doc: DBCollectionDoc): Collection {
    return {
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