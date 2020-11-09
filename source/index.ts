import App from './app';
import dotenv from 'dotenv';
if (process.argv.includes('--test') || process.argv.includes('-t')) {
    dotenv.config({ path: './.env.test' });
} else {
    dotenv.config();
}

new App();