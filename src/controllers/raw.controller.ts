import { JsonController, Get } from 'routing-controllers';
import { server } from '../app';

@JsonController('/raw')
export class RawController {

    @Get('/')
    showUsage() {
        return server.owfsClient.list('/');
    }

};

// this.app.get('/:id', (req: express.Request, res: express.Response) => {
//     this.owfsClient.list('/' + req.params.id).then((result: any) => {
//         res.json(result);
//     });
// });
// this.app.get('/:id/:type', (req: express.Request, res: express.Response) => {
//     this.owfsClient.read('/' + req.params.id + '/' + req.params.type).then((result: any) => {
//         res.json(result);
//     });
// });
// this.app.put('/:id/:type', (req: express.Request, res: express.Response) => {
//     const value: any = req.body;
//     this.owfsClient.write('/' + req.params.id + '/' + req.params.type, value).then((result: any) => {
//         res.json(result);
//     });
// });

