import { RequestPromiseAPI } from 'request-promise'

export class FacebookGraph {
    constructor(private request: RequestPromiseAPI) { }

    public async makeRequest(
        access_token: string,
        sourceId: string,
        type: string,
        queryParams?: IDefaultGetQueryParams,
    ) {
        const raw = JSON.parse(await this.request.get({
            qs: { access_token, ...queryParams },
            uri: `https://graph.facebook.com/${sourceId}/${type}`,
        }))

        return raw.data || raw
    }
}

interface IDefaultGetQueryParams {
    fields?: string
    limit?: number
}
