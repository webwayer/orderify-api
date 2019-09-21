import { Router } from "express"
import session, { Store } from "express-session"

export function statefulRouterFactory(
    router: Router,
    sessionStore: Store,
    CONFIG: { HTTPS_ONLY_COOKIES: string; SIGNING_SECRET: string },
) {
    router.use(session({
        secret: CONFIG.SIGNING_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: !!CONFIG.HTTPS_ONLY_COOKIES,
            sameSite: "lux",
            httpOnly: true,
        },
    }))

    return router
}
