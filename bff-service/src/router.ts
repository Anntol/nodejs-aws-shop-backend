import { IncomingMessage, ServerResponse } from 'http';
import { StatusCodes } from 'http-status-codes';

export default function route(req: IncomingMessage, res: ServerResponse) {
    try {
        console.log('Url: ', req.url);
        console.log('Method: ', req.method);

    } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error) SetServerError(error, res);
    }
}

function SetServerError(error: Error, res: ServerResponse) {
    console.error(error.message);

    res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal Server Error!' }));
}