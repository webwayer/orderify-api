import { RequestPromiseAPI } from 'request-promise'

export function facebookGraphFactory(request: RequestPromiseAPI) {
    async function makeRequest(access_token: string, sourceId: string, type: string, queryParams?: defaultGetQueryParams) {
        const raw = JSON.parse(await request.get({
            qs: Object.assign({ access_token }, queryParams),
            uri: `https://graph.facebook.com/${sourceId}/${type}`
        }))

        return raw.data
    }

    interface defaultGetQueryParams {
        fields?: string
        limit?: number
    }

    return {
        makeRequest
    }
}