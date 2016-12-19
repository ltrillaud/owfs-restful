import 'reflect-metadata';
import { Server } from './server';
import * as nconf from 'nconf';

// import controllers here
import './controllers/root.controller';
import './controllers/raw.controller';
import './controllers/appliances.controller';

// create server and listen
export const server = Server.bootstrap();
server.setup();
const port: number = nconf.get('port');
server.app.listen(port, () => {
    console.log('  owfsRest.ts listening on port ' + port + '!');
});
