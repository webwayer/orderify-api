import { Router } from 'express'

import { FacebookOauth } from './_/_/FacebookOauth'
import { UserProfileOnFacebook } from './_/UserProfileOnFacebook'
import { PKCE, Auth, JWTAccessToken } from '@orderify/oauth_server'

export function facebookAuthRouterFactory(
    CONFIG: { HOST: string, PORT: string, PROTOCOL: string },
    userProfileOnFacebook: UserProfileOnFacebook,
    facebookOauth: FacebookOauth,
    auth: Auth,
    pkce: PKCE,
    jwtAccessToken: JWTAccessToken,
) {
    const router = Router()

    router.get('/', (req, res) => {
        const { code_challenge } = req.query

        if (!code_challenge) {
            throw new Error('code_challenge shouldnt be empty but sha256 of code_verifier')
        }

        const facebookLoginUrl = facebookOauth.generateStartOauthUrl({
            redirect_uri: `${CONFIG.PROTOCOL}://${CONFIG.HOST}:${CONFIG.PORT}${req.originalUrl.split('?')[0]}/callback`,
            scope: 'email,user_photos',
            response_type: 'code,granted_scopes',
            state: code_challenge,
        })

        res.redirect(facebookLoginUrl)
    })

    router.get(`/callback`, async (req, res, next) => {
        try {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(
                    code,
                    `${CONFIG.PROTOCOL}://${CONFIG.HOST}:${CONFIG.PORT}${req.originalUrl.split('?')[0]}`,
                )

                if (access_token) {
                    const accessData = {
                        access_token,
                        expires_in,
                        token_type,
                        granted_scopes,
                        denied_scopes,
                    }

                    const user = await userProfileOnFacebook.createOrUpdate(accessData)
                    const pkceCode = await pkce.start(user.id, state)

                    res.redirect(`/#code=${pkceCode}`)
                }
            }
        } catch (err) {
            next(err)
        }
    })

    router.get(`/exchangeCode`, async (req, res, next) => {
        try {
            const { code, code_verifier } = req.query

            if (!code || !code_verifier) {
                throw new Error('code & code_verifier should be empty')
            }

            const userId = await pkce.verify(code, code_verifier)
            const accessToken = await auth.logIn(userId)
            const token = await jwtAccessToken.create(accessToken)

            res.json({ token })
        } catch (err) {
            next(err)
        }
    })

    return router
}
