import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as nconf from 'nconf';
import * as owfs from './owfs';

// import * as path from 'path';
// import * as indexRoute from "./routes/index";

class Server {
    private owfsClient: owfs.Client;
    public app: express.Application;

    public static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = express();
        this.config();
        this.routes();

        this.owfsClient = new owfs.Client({ host: '192.168.1.2' });
    }

    private config() {
        // this.app.use(logger("dev"));

        // mount json form parser
        this.app.use(bodyParser.json());

        // mount query string parser
        this.app.use(bodyParser.urlencoded({ extended: true }));

        // catch 404 and forward to error handler
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            const error = new Error('Not Found');
            err.status = 404;
            next(err);
        });
    }

    private routes() {
        // get router
        // let router: express.Router;
        // router = express.Router();

        // create routes
        // var index: indexRoute.Index = new indexRoute.Index();

        // home page
        // router.get("/", index.index.bind(index.index));

        // use router middleware
        // this.app.use(router);

        this.app.get('/', (req: express.Request, res: express.Response) => {
            this.owfsClient.list('/').then((result: any) => {
                res.json(result);
            });
            // this.owfsClient.read('/81.F83332000000/type').then((result: any) => {
            //     res.send(result);
            // });

        });
        this.app.get('/:id', (req: express.Request, res: express.Response) => {
            this.owfsClient.list('/' + req.params.id).then((result: any) => {
                res.json(result);
            });
        });
        this.app.get('/:id/:type', (req: express.Request, res: express.Response) => {
            this.owfsClient.read('/' + req.params.id + '/' + req.params.type).then((result: any) => {
                res.json(result);
            });
        });
        this.app.put('/:id/:type', (req: express.Request, res: express.Response) => {
            const value: any = req.body;
            this.owfsClient.write('/' + req.params.id + '/' + req.params.type, value).then((result: any) => {
                res.json(result);
            });
        });
    }
}

// --- get configuration, in order, from arguments, environment and default
nconf.argv().env().defaults({
    port: 8080,
    profile: './profiles/default.js'
});

// --- load the given profile
console.log('  owfsRest.ts use profile file (' + nconf.get('profile') + ')');
const profile = require(nconf.get('profile'));

const port: number = nconf.get('port');
const server = Server.bootstrap();
export = server.app;
server.app.listen( port, () => {
    console.log('  owfsRest.ts listening on port ' + port + '!');
});
