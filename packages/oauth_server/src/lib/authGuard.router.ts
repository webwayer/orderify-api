import { Router } from 'express'

import { Auth } from './_/Auth'
import { JWTAccessToken } from './_/JWTAccessToken'

export function authGuardRouterFactory(
    auth: Auth,
    jwtAccessToken: JWTAccessToken,
) {
    const router = Router()

    router.use(async (req, res, next) => {
        try {
            if (!req.headers.authorization) {
                throw new Error('no accessToken provided')
            }

            const authHeader = req.headers.authorization.split(' ')
            const rawToken = authHeader[1]
            const token = await jwtAccessToken.verify(rawToken)
            const userId = await auth.verify(token.jti)

            // tslint:disable-next-line: no-string-literal
            req['userId'] = userId
            // tslint:disable-next-line: no-string-literal
            req['tokenId'] = token.jti
        } catch (err) {
            next(err)
        }

        next()
    })

    router.get('/logout', async (req, res, next) => {
        try {
            // tslint:disable-next-line: no-string-literal
            if (!req['tokenId']) {
                throw new Error('user isnt logged in')
            }

            // tslint:disable-next-line: no-string-literal
            await auth.logOut(req['tokenId'])
        } catch (err) {
            next(err)
        }

        res.sendStatus(200)
    })

    return router
}
