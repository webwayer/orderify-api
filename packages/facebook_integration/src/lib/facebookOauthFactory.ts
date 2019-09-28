import { RequestPromiseAPI } from 'request-promise'

interface IFacebookConfig { CLIENT_ID: string; CLIENT_SECRET: string }

export function facebookOauthFactory(
    requestPromise: RequestPromiseAPI,
    CONFIG: IFacebookConfig & { OAUTH_REDIRECT_URL: string },
) {
    function generateStartOauthUrl(queryParams: IGenerateStartOauthUrlQueryParams): string {
        const query = Object.entries({
            ...queryParams,
            client_id: CONFIG.CLIENT_ID,
            redirect_uri: CONFIG.OAUTH_REDIRECT_URL,
        }).map(([key, value]) => `${key}=${value}`).join('&')

        return `https://www.facebook.com/v4.0/dialog/oauth?${query}`
    }

    interface IGenerateStartOauthUrlQueryParams {
        response_type: string
        scope: string
        state?: string
    }

    async function exchangeCodeForAcessToken(code: string): Promise<IExchangeCodeForAcessTokenReturnObject> {
        return JSON.parse(await requestPromise.get({
            qs: {
                code,
                client_id: CONFIG.CLIENT_ID,
                client_secret: CONFIG.CLIENT_SECRET,
                redirect_uri: CONFIG.OAUTH_REDIRECT_URL,
            },
            uri: 'https://graph.facebook.com/v4.0/oauth/access_token',
        }))
    }

    interface IExchangeCodeForAcessTokenReturnObject {
        access_token: string
        expires_in: number
        token_type: 'bearer'
    }

    return {
        exchangeCodeForAcessToken,
        generateStartOauthUrl,
    }
}

export type IFacebookOauth = ReturnType<typeof facebookOauthFactory>
