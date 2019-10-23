import { IJobs } from '@orderify/io'

export class ImageStorage {
    constructor(
        private CONFIG: { BUCKET_NAME: string },
        private jobs: IJobs,
    ) { }

    public async uploadFromUrl(urls: Array<{ id: string, url: string }>) {
        return this.jobs.url_to_s3(urls.map(({ url, id }) => ({
            Key: id,
            Url: url,
            Bucket: this.CONFIG.BUCKET_NAME,
            ContentType: 'image/jpeg',
        })))
    }

    public fileUrl(id) {
        return `https://${this.CONFIG.BUCKET_NAME}.s3.amazonaws.com/${id}`
    }
}
