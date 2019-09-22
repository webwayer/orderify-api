import { IRequest } from '@orderify/io'

export function facebookOauthFactory(requestPromise: IRequest, CONFIG: IApiConfig & IFacebookConfig) {
    const redirect_uri = `${CONFIG.PROTOCOL}://${CONFIG.HOST}:${CONFIG.PORT}/${CONFIG.REDIRECT_PATH}`

    function generateStartOauthUrl(queryParams: IGenerateStartOauthUrlQueryParams): string {
        const query = Object.entries({...queryParams,  client_id: CONFIG.CLIENT_ID, redirect_uri}).map(([key, value]) => `${key}=${value}`).join('&')

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
                redirect_uri,
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

interface IApiConfig { HOST: string; PORT: string; PROTOCOL: string }
interface IFacebookConfig { CLIENT_ID: string; CLIENT_SECRET: string; REDIRECT_PATH: string }
