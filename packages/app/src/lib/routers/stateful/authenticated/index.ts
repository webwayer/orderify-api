import { Router } from 'express'
import { IAccessTokenStatic, verifyToken } from '@orderify/user'

export function authenticatedRouterFactory(
    router: Router,
    CONFIG: { BASE_URL: string },
    AccessToken: IAccessTokenStatic,
) {
    router.get('/login', (req, res) => {
        res.send(`<a href="${CONFIG.BASE_URL}/login/facebook">Facebook login</a>`)
    })

    router.use((req, res, next) => {
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization.split('_')
            const tokenRaw = authHeader[1]
            const token = verifyToken(tokenRaw)

            // tslint:disable-next-line: no-string-literal
            req['userId'] = token.uid
            return next()
        }
        res.redirect('/login')
    })

    return router
}
