import { Router } from 'express'
import { IAccessTokenStatic, verifyToken } from '@orderify/user_profile'

export function authenticatedRouterFactory(
    router: Router,
    AccessToken: IAccessTokenStatic,
) {
    router.get('/favicon.ico', (req, res) => {
        res.status(404).end()
    })
    // some graphqli thing i think
    router.get('/unfetch.umd.js.map', (req, res) => {
        res.status(404).end()
    })

    router.use(async (req, res, next) => {
        try {
            if (req.query.token) {
                // if (req.headers.authorization) {
                // const authHeader = req.headers.authorization.split('_')
                // const tokenRaw = authHeader[1]
                const tokenRaw = req.query.token
                const token = verifyToken(tokenRaw)

                const accessToken = AccessToken.findByPk(token.id)
                if (accessToken) {
                    // tslint:disable-next-line: no-string-literal
                    req['userId'] = token.uid

                    next()
                } else {
                    throw new Error('accessToken doesnt exist in database')
                }
            } else {
                throw new Error('no accessToken provided')
            }
        } catch (err) {
            next(err)
        }
    })

    return router
}
