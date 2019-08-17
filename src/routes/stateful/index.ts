import { Router } from 'express'
import * as session from 'express-session'

import { router as authRouter } from './auth'

export const router = Router();

router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}))
router.use(authRouter)