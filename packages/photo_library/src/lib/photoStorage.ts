import { IRequest } from '@orderify/io'

export function photoStorageFactory(request: IRequest, CONFIG: { BUCKET_NAME: string, API_GATEWAY_KEY: string }) {
    async function uploadFromUrl(id: number, url: string) {
        return request({
            method: 'GET',
            uri: 'https://etswpy5xvl.execute-api.eu-central-1.amazonaws.com/default/url_to_s3',
            qs: {
                Key: id,
                Url: url,
                Bucket: CONFIG.BUCKET_NAME,
            },
            headers: {
                'x-api-key': CONFIG.API_GATEWAY_KEY,
            },
        })
    }

    return {
        uploadFromUrl,
    }
}
