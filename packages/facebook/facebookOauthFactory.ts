import { RequestPromiseAPI } from 'request-promise'

export function facebookOauthFactory(requestPromise: RequestPromiseAPI, CONFIG: API_CONFIG & FACEBOOK_CONFIG) {
    const redirect_uri = `${CONFIG.PROTOCOL}://${CONFIG.HOST}:${CONFIG.PORT}/${CONFIG.REDIRECT_PATH}`

    function generateStartOauthUrl(queryParams: generateStartOauthUrlQueryParams): string {
        const query = Object.entries(Object.assign({}, queryParams, { client_id: CONFIG.CLIENT_ID, redirect_uri })).map(([key, value]) => `${key}=${value}`).join('&')

        return `https://www.facebook.com/v4.0/dialog/oauth?${query}`
    }

    interface generateStartOauthUrlQueryParams {
        scope: string
        state: string
        response_type: string
    }

    async function exchangeCodeForAcessToken(code: string): Promise<exchangeCodeForAcessTokenReturnObject> {
        return JSON.parse(await requestPromise.get({
            qs: {
                code,
                client_id: CONFIG.CLIENT_ID,
                client_secret: CONFIG.CLIENT_SECRET,
                redirect_uri
            },
            uri: `https://graph.facebook.com/v4.0/oauth/access_token`
        }))
    }

    interface exchangeCodeForAcessTokenReturnObject {
        access_token: string
        token_type: 'bearer'
        expires_in: number
    }

    return {
        exchangeCodeForAcessToken,
        generateStartOauthUrl,
    }
}

interface API_CONFIG { HOST: string, PORT: string, PROTOCOL: string }
interface FACEBOOK_CONFIG { CLIENT_ID: string, CLIENT_SECRET: string, REDIRECT_PATH: string }