import { Router } from 'express'

export function authenticatedRouterFactory(router: Router, CONFIG: { BASE_URL: string }) {
    router.get('/login', (req, res) => {
        res.send(`<a href="${CONFIG.BASE_URL}/login/facebook">Facebook login</a>`)
    })

    router.use((req, res, next) => {
        if (!req.session.userId) {
            res.redirect('/login')
        } else {
            next()
        }
    })

    return router;
}

