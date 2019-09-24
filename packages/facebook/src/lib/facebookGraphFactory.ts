import { IRequest } from '@orderify/io'

export function facebookGraphFactory(request: IRequest) {
    async function makeRequest(
        access_token: string,
        sourceId: string,
        type: string,
        queryParams?: IDefaultGetQueryParams,
    ) {
        const raw = JSON.parse(await request.get({
            qs: { access_token, ...queryParams },
            uri: `https://graph.facebook.com/${sourceId}/${type}`,
        }))

        return raw.data || raw
    }

    interface IDefaultGetQueryParams {
        fields?: string
        limit?: number
    }

    return {
        makeRequest,
    }
}

export type IFacebookGraph = ReturnType<typeof facebookGraphFactory>
