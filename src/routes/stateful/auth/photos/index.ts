import { Router } from 'express'

export const router = Router();

router.get('/', function (req, res) {
    console.log(req.session)
    res.send('Hello World')
})