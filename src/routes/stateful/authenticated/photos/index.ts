import { Router } from 'express'
import { AlbumType } from 'Album';

export function photosRouterFactory() {
    const router = Router();

    router.get('/', function (req, res) {
        console.log(req.session, req.user)
        res.send('Hello World')
    })

    return router;
}