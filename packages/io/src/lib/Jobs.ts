export class Jobs {
    constructor(private lambda: AWS.Lambda) { }

    public async url_to_s3(urls: Array<{ Key: string, Url: string, Bucket: string, ContentType: string }>) {
        await this.lambda.invoke({
            FunctionName: 'url_to_s3',
            Payload: JSON.stringify(urls),
        }).promise()
    }
}

type PublicPart<T> = { [K in keyof T]: T[K] }
export type IJobs = PublicPart<Jobs>
