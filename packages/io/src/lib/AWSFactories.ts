import AWS from 'aws-sdk'

interface IAWSConfig {
    KEY: string
    KEY_ID: string
    REGION: string
}

export function S3Factory(CONFIG: IAWSConfig) {
    return new AWS.S3({
        accessKeyId: CONFIG.KEY_ID,
        secretAccessKey: CONFIG.KEY,
        region: CONFIG.REGION,
        signatureVersion: 'v4',
    })
}
