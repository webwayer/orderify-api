import { RequestPromiseAPI } from 'request-promise'

interface IFacebookConfig {
    CLIENT_ID: string
    CLIENT_SECRET: string
    OAUTH_REDIRECT_URL: string
}

export class FacebookOauth {
    constructor(
        private request: RequestPromiseAPI,
        private CONFIG: IFacebookConfig,
    ) { }

    public generateStartOauthUrl(queryParams: IGenerateStartOauthUrlQueryParams): string {
        const query = Object.entries({
            ...queryParams,
            client_id: this.CONFIG.CLIENT_ID,
            redirect_uri: this.CONFIG.OAUTH_REDIRECT_URL,
        }).map(([key, value]) => `${key}=${value}`).join('&')

        return `https://www.facebook.com/v4.0/dialog/oauth?${query}`
    }

    public async exchangeCodeForAcessToken(code: string): Promise<IExchangeCodeForAcessTokenReturnObject> {
        return JSON.parse(await this.request.get({
            qs: {
                code,
                client_id: this.CONFIG.CLIENT_ID,
                client_secret: this.CONFIG.CLIENT_SECRET,
                redirect_uri: this.CONFIG.OAUTH_REDIRECT_URL,
            },
            uri: 'https://graph.facebook.com/v4.0/oauth/access_token',
        }))
    }
}

interface IGenerateStartOauthUrlQueryParams {
    response_type: string
    scope: string
    state?: string
}

interface IExchangeCodeForAcessTokenReturnObject {
    access_token: string
    expires_in: number
    token_type: 'bearer'
}
