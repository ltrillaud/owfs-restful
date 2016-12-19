import { createExpressServer, } from 'routing-controllers';
import { Application } from 'express';
import { AppliancesModel } from './models/appliances.model';

import * as nconf from 'nconf';
import * as owfs from './owfs';

export class Server {
    public owfsClient: owfs.Client;
    public app: Application;
    public options: any;
    public profile: any;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        // --- create the express server
        this.app = createExpressServer();
        this.parseOptions();
        this.config();
    }

    private parseOptions() {
        // --- get configuration, in order, from arguments, environment and default
        nconf.argv().env().defaults({
            port: 8080,
            profile: './profiles/default.js',
            morganPredefinedFormat: 'dev'
        });

        // --- load the given profile
        console.log('  owfsRest.ts use profile file (' + nconf.get('profile') + ')');
        this.profile = require(nconf.get('profile'));
    }

    private config() {
        // ---  configure middleware
        const morgan = require('morgan');
        this.app.use(morgan(nconf.get('morganPredefinedFormat')));
    }

    public setup() {
        // --- prepare OWFS client
        this.owfsClient = new owfs.Client({ host: '192.168.1.2' });

        // --- setup Appliances
        AppliancesModel.register( this.profile.appliance2proxy);
    }

    public tearOff() {

    }
}
