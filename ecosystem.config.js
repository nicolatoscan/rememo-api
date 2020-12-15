module.exports = {
    apps: [{
        name: 'rememo-api',
        script: './dist/source/index.js',
        instances: 'max',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        }
    }]
};