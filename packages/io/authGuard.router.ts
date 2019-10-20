import { Router } from 'express'
import { Auth } from '../oauth_server/src/lib/_/Auth'

export function authGuardRouterFactory(
    auth: Auth,
) {
    const router = Router()

    router.use(async (req, res, next) => {
        try {
            if (req.query.token) {
                // if (req.headers.authorization) {
                // const authHeader = req.headers.authorization.split('_')
                // const tokenRaw = authHeader[1]
                const tokenRaw = req.query.token
                const accessToken = await auth.verify(tokenRaw)

                if (accessToken) {
                    // tslint:disable-next-line: no-string-literal
                    req['userId'] = accessToken.uid

                    next()
                } else {
                    throw new Error('accessToken doesnt exist')
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
