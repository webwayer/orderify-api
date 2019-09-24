import { IRequest } from '@orderify/io'
// tslint:disable-next-line: no-submodule-imports
import S3 from 'aws-sdk/clients/s3'

export function photoStorageFactory(request: IRequest, CONFIG: { BUCKET_NAME: string, API_GATEWAY_KEY: string }) {
    async function uploadFromUrl(id: string, url: string) {
        return request({
            method: 'GET',
            uri: 'https://etswpy5xvl.execute-api.eu-central-1.amazonaws.com/default/url_to_s3',
            qs: {
                Key: id.toString(),
                Url: url,
                Bucket: CONFIG.BUCKET_NAME,
                ContentType: 'image/jpeg',
            },
            headers: {
                'x-api-key': CONFIG.API_GATEWAY_KEY,
            },
        })
    }

    async function getPresignedImageUrl(id: string) {
        const s3 = new S3({
            signatureVersion: 'v4',
            region: 'eu-central-1',
        })
        const url = await s3.getSignedUrlPromise('getObject', {
            Key: id.toString(),
            Bucket: CONFIG.BUCKET_NAME,
            Expires: 60 * 60,
        })

        return url
    }

    return {
        uploadFromUrl,
        getPresignedImageUrl,
    }
}

export type IImageStorage = ReturnType<typeof photoStorageFactory>
