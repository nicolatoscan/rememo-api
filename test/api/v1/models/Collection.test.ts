import { assert } from 'chai';
import { Collection, Word, validateCollection, validateWord, createDBCollectionDoc } from '../../../../source/api/v1/models/Collection';

export default function (): void {
    describe('Collection', function () {
        it('should validate Collection', function() {
            const collections: Collection[] = [{
                index: 1,
                name: 'Testing Collection',
                description: 'Testing description',
                owner: 'pippo',
                words: [{
                    index: 1,
                    original: 'Red',
                    translation: 'Rosso',
                },{
                    index: 1,
                    original: 'Red',
                    translation: 'Rosso',
                    languageFrom: 'en',
                    languageTo: 'it',
                }],
            },{
                index: 1,
                name: 'Testing Collection',
                description: 'Testing description',
                owner: 'pippo',
                languageFrom: 'en',
                languageTo: 'it',
                words: [],
            }];

            for (const c of collections) {
                const res = validateCollection(c);
                assert.isUndefined(res.error, res.error);
                assert.deepEqual(c, res.value, 'Object not equal to source object');
            }
        });

        it('should not validate Collection', function() {
            const collections: unknown[] = [{
                index: -1,
                name: 'Testing Collection',
                description: 'Testing description',
                owner: 'pippo',
                words: [],
            },{
                index: 1,
                name: 'Testing Collection',
                description: 'Testing description',
                owner: 'pippo',
                words: [{
                    bad: 'prop',
                    index: 1,
                    original: 'Red',
                    translation: 'Rosso',
                },{
                    index: 1,
                    original: 'Red',
                    translation: 'Rosso',
                    languageFrom: 'en',
                    languageTo: 'it',
                }]
            }];

            for (const c of collections) {
                const res = validateCollection(c);
                assert.isString(res.error, `No error string returned on ${JSON.stringify(c)}`);
                assert.isUndefined(res.value, 'Returned incorrect value');
            }
        });

        it('should validate Word', function() {
            const words: Word[] = [{
                index: 1,
                original: 'Red',
                translation: 'Rosso',
                languageFrom: 'en',
                languageTo: 'it'
            }, {
                index: 1,
                original: 'Red',
                translation: 'Rosso'
            }];

            for (const w of words) {
                const res = validateWord(w);
                assert.isUndefined(res.error, res.error);
                assert.deepEqual(w, res.value, 'Object not equal to source object');
            }
        });

        it('should not validate Word', function() {
            const users: unknown[] = [{
                index: 1,
                original: 'Red',
                translation: 'Rosso',
                languageFrom: 'badcode',
                languageTo: 'it'
            }, {
                index: -1,
                original: 'Red',
                translation: 'Rosso'
            }];

            for (const u of users) {
                const res = validateWord(u);
                assert.isString(res.error, `No error string returned on ${JSON.stringify(u)}`);
                assert.isUndefined(res.value, 'Returned incorrect value');
            }
        });

        it('should create a db collection', function() {
            const collections: Collection[] = [{
                index: 1,
                name: 'Testing Collection',
                description: 'Testing description',
                owner: 'pippo',
                words: [{
                    index: 0,
                    original: 'Red',
                    translation: 'Rosso',
                },{
                    index: 1,
                    original: 'Red',
                    translation: 'Rosso',
                    languageFrom: 'en',
                    languageTo: 'it',
                }],
            }];

            for (const c of collections) {
                const res = createDBCollectionDoc(c);
                assert.equal(res.index, c.index);
                assert.equal(res.name, c.name);
                assert.equal(res.description, c.description);
                assert.equal(res.owner,  c.owner);
                assert.equal(res.words[0].index, c.words[0].index);
                assert.equal(res.words[1].index, c.words[1].index);
                assert.equal(res.words[0].original, c.words[0].original);
                assert.equal(res.words[1].original, c.words[1].original);
                assert.equal(res.words[0].translation, c.words[0].translation);
                assert.equal(res.words[1].translation, c.words[1].translation);
                assert.isUndefined(res.words[0].languageFrom, c.words[0].languageFrom);
                assert.isUndefined(res.words[0].languageTo, c.words[0].languageTo);
                assert.equal(res.words[1].languageFrom, c.words[1].languageFrom);
                assert.equal(res.words[1].languageTo, c.words[1].languageTo);
            }

        });
    });
}