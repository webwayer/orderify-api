import { randomBytes } from "crypto"
import { Router } from "express"

import { facebookOauthFactory } from "../../../facebook/facebookOauthFactory"
import { photoLibraryOnFacebookFactory } from "../../../photo_library/photoLibraryOnFacebook"
import { userFacebookFactory } from "../../../user/userFacebook"

export function facebookLoginRouterFactory(
    router: Router,
    CONFIG: { REDIRECT_PATH: string },
    userFacebook: ReturnType<typeof userFacebookFactory>,
    facebookOauth: ReturnType<typeof facebookOauthFactory>,
    photoLibraryOnFacebook: ReturnType<typeof photoLibraryOnFacebookFactory>,
) {
    router.get("/login/facebook", async (req, res) => {
        const csrf_token = await cryptoRandomBytes(128)

        req.session.facebook_login_csrf_token = csrf_token

        const queryParams = {
            scope: "email,user_photos",
            state: csrf_token,
            response_type: "code,granted_scopes",
        }

        const facebookLoginUrl = facebookOauth.generateStartOauthUrl(queryParams)

        res.redirect(facebookLoginUrl)
    })

    router.get(`/${CONFIG.REDIRECT_PATH}`, async (req, res) => {
        const { code, granted_scopes, denied_scopes, state, error_reason, error, error_description } = req.query

        if (!error && state === req.session.facebook_login_csrf_token) {
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
                    await userFacebook.updateFacebookMetadata(user.id, accessData)
                }

                await new Promise((resolve, reject) => {
                    req.session.regenerate((err) => err ? reject(err) : resolve())
                })

                req.session.userId = user.id
            }
        }

        res.redirect("/photos")
    })

    return router
}

async function cryptoRandomBytes(num: number): Promise<string> {
    return new Promise((resolve, reject) => {
        randomBytes(num, (err, buffer) => {
            if (err) {
                reject(err)
            }
            resolve(buffer.toString("hex"))
        })
    })
}
