import 'reflect-metadata';
import { Server } from './server';
import * as nconf from 'nconf';

// import controllers here
import './controllers/root.controller';
import './controllers/raw.controller';

// create server and listen
export const server = Server.bootstrap();
const port: number = nconf.get('port');
server.app.listen(port, () => {
    console.log('  owfsRest.ts listening on port ' + port + '!');
});
