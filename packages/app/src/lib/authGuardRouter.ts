import { Router } from 'express'
import { IAccessTokenStatic, verifyToken } from '@orderify/user'

export function authenticatedRouterFactory(
    router: Router,
    AccessToken: IAccessTokenStatic,
) {
    router.use((req, res, next) => {
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization.split('_')
            const tokenRaw = authHeader[1]
            const token = verifyToken(tokenRaw)

            AccessToken.findByPk(token.id).then((accessToken) => {
                if (accessToken) {
                    // tslint:disable-next-line: no-string-literal
                    req['userId'] = token.uid
                    next()
                } else {
                    res.redirect('/login')
                }
            }).catch((err) => {
                next(err)
            })
        } else {
            res.redirect('/login')
        }
    })

    return router
}
