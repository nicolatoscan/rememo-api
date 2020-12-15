import app from './app';
import dotenv from 'dotenv';

if (process.argv.includes('--test') || process.argv.includes('-t')) {
    dotenv.config({ path: './.env.test' });
    console.log('Using test environment');
} else {
    dotenv.config();
}

let port = 0;
if (process.argv.includes('--port')) {
    port = +process.argv[process.argv.indexOf('--port') + 1];
}

if (port)
    app(port);
else
    app();