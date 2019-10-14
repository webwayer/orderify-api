import { Router } from 'express'

import { FacebookOauth } from './_/_/FacebookOauth'
import { UserProfileOnFacebook } from './_/UserProfileOnFacebook'

export function facebookAuthRouterFactory(
    CONFIG: { OAUTH_REDIRECT_PATH: string },
    userProfileOnFacebook: UserProfileOnFacebook,
    facebookOauth: FacebookOauth,
) {
    const router = Router()

    router.get('/login/facebook', (req, res) => {
        const facebookLoginUrl = facebookOauth.generateStartOauthUrl({
            scope: 'email,user_photos',
            response_type: 'code,granted_scopes',
        })

        res.redirect(facebookLoginUrl)
    })

    router.get(`/${CONFIG.OAUTH_REDIRECT_PATH}`, async (req, res, next) => {
        try {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(code)

                if (access_token) {
                    const accessData = {
                        access_token,
                        expires_in,
                        token_type,
                        granted_scopes,
                        denied_scopes,
                    }

                    const tokenRaw = await userProfileOnFacebook.findByAccessToken(access_token) ?
                        await userProfileOnFacebook.signIn(accessData) :
                        await userProfileOnFacebook.signUp(accessData)

                    res.redirect(`/?token=${tokenRaw}`)
                }
            }
        } catch (err) {
            next(err)
        }
    })

    return router
}
