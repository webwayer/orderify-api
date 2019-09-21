import * as session from 'express-session'
import { Store } from 'express-session'
import { Router } from 'express'

export function statefulRouterFactory(router: Router, sessionStore: Store, CONFIG: { SIGNING_SECRET: string, HTTPS_ONLY_COOKIES: string }) {
    router.use(session({
        secret: CONFIG.SIGNING_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: !!CONFIG.HTTPS_ONLY_COOKIES,
            sameSite: 'lux',
            httpOnly: true,
        }
    }))

    return router;
}