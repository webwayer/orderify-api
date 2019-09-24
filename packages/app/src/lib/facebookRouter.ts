import { Router } from 'express'

import { IFacebookOauth, photoLibraryOnFacebookFactory, userFacebookFactory } from '@orderify/facebook'
import { IAccessTokenStatic, createToken } from '@orderify/user'
import { newId } from '@orderify/io'

export function facebookLoginRouterFactory(
    router: Router,
    CONFIG: { REDIRECT_PATH: string },
    userFacebook: ReturnType<typeof userFacebookFactory>,
    facebookOauth: IFacebookOauth,
    photoLibraryOnFacebook: ReturnType<typeof photoLibraryOnFacebookFactory>,
    AccessToken: IAccessTokenStatic,
) {
    router.get('/login/facebook', (req, res) => {
        const facebookLoginUrl = facebookOauth.generateStartOauthUrl({
            scope: 'email,user_photos',
            response_type: 'code,granted_scopes',
        })

        res.redirect(facebookLoginUrl)
    })

    router.get(`/${CONFIG.REDIRECT_PATH}`, async (req, res, next) => {
        try {
            const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

            if (code) {
                const { access_token, expires_in, token_type } = await facebookOauth.exchangeCodeForAcessToken(code)

                const accessData = {
                    access_token,
                    expires_in,
                    token_type,
                    granted_scopes,
                    denied_scopes,
                }

                if (access_token) {
                    let user = await userFacebook.findByFacebookAccessToken(access_token)
                    if (!user) {
                        user = await userFacebook.createFromFacebook(accessData)

                        await photoLibraryOnFacebook.download(user.id, access_token)
                    } else {
                        await userFacebook.updateMetadata(user.id, accessData)
                    }

                    const accessTokenId = newId()

                    await AccessToken.create({
                        id: accessTokenId,
                        userId: user.id,
                    })
                    const tokenRaw = createToken({
                        id: accessTokenId,
                        uid: user.id,
                    })

                    res.redirect(`/?token=${tokenRaw}`)
                    // res.end()
                }
            }
        } catch (err) {
            next(err)
        }
    })

    return router
}
