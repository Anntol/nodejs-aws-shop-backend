import http from 'http';
import route from './router';

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    route(req, res);
});

process.on('unhandledRejection', (err: Error) => {
    const { message, stack } = err;
    console.error(`Unhandled rejection occured! ${message}. Stack: ${stack}`);
    process.exit(1);
});

server.listen(PORT,
    () => console.log(`Server running on port: ${PORT}`)
);