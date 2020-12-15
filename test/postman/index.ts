import { cleanDb } from '../../source/utils/misc.utils';
import newman from 'newman';
import * as path from 'path';
import dotenv from 'dotenv';
import { ChildProcess, spawn } from 'child_process';
dotenv.config({ path: './.env.test' });

export default async function() {
    
    describe('Postaman Tests', function() {
        let childServer: ChildProcess;
        
        before(async function() {
            this.timeout(7500);
            console.log('Starting server in background ...');
            childServer = spawn('node', ['dist/source/index.js', '--test', '--port', process.env.PORT ?? '4000']);
            await new Promise((res) => setTimeout(res, 7000));
        });

        after(async function() {
            console.log('Killing server in background ...');
            childServer.kill('SIGINT');
        });


        async function runPostmanTests(collectionPath: string, envPath: string) {
            await new Promise((resolve, reject) => {
                newman.run({
                    collection: require(path.join(__dirname, collectionPath)),
                    environment: require(path.join(__dirname, envPath)),
                    reporters: 'cli',
                }, function (err, summary) {
                    if (err) { 
                        reject(err);
                    }
                    if (summary.run.failures.length > 0) {
                        reject(`${summary.run.failures.length} postman errors`);
                    }
                    resolve(null);
                });
            });
        }

        it('Should run v1 postman tests', async function() {
            this.timeout(20000);
            await cleanDb();
            await runPostmanTests(
                '../../../test/postman/v1/Rememo.postman_collection.json',
                '../../../test/postman/v1/Rememo.postman_environment.json'
            );
        });

        it('Should run v2 postman tests', async function() {
            this.timeout(20000);
            await cleanDb();
            await runPostmanTests(
                '../../../test/postman/v2/Rememo.postman_collection.json',
                '../../../test/postman/v2/Rememo.postman_environment.json'
            );
        });
    });
}