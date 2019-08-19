import { Router } from 'express'

export function photosRouterFactory() {
    const router = Router();

    router.get('/', function (req, res) {
        console.log(req.session)
        res.send('Hello World')
    })

    return router;
}