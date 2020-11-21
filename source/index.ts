import App from './app';
import dotenv from 'dotenv';

if (process.argv.includes('--test') || process.argv.includes('-t')) {
    dotenv.config({ path: './.env.test' });
    console.log('Using test environment');
} else {
    dotenv.config();
}

new App();