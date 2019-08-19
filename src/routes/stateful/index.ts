import * as session from 'express-session'
import { Store } from 'express-session'
import { Router } from 'express'

export function statefulRouterFactory(sessionStore: Store) {
    const router = Router();

    router.use(session({
        secret: 'keyboard cat',
        store: sessionStore,
        resave: false,
        saveUninitialized: true,
        // cookie: { secure: true }
    }))

    return router;
}