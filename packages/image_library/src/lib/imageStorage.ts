import AWS from 'aws-sdk'

export class ImageStorage {
    constructor(
        private s3: AWS.S3,
        private lambda: AWS.Lambda,
        private CONFIG: { BUCKET_NAME: string },
    ) { }

    public async uploadFromUrl(id: string, url: string) {
        return this.lambda.invokeAsync({
            FunctionName: 'url_to_s3',
            InvokeArgs: {
                Key: id.toString(),
                Url: url,
                Bucket: this.CONFIG.BUCKET_NAME,
                ContentType: 'image/jpeg',
            },
        }).promise
    }

    public async getPresignedImageUrl(id: string) {
        const url = await this.s3.getSignedUrlPromise('getObject', {
            Key: id.toString(),
            Bucket: this.CONFIG.BUCKET_NAME,
            Expires: 60 * 60,
        })

        return url
    }
}
