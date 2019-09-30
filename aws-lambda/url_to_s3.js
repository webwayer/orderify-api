const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const https = require('https')

exports.handler = async events => {
    return Promise.all(events.map(event => process(event)))
}

async function process(event) {
    const res = await new Promise((resolve, reject) => {
        https.get(event.Url, res => {
            if (res.statusCode !== 200) {
                reject(res.statusCode)
            } else {
                resolve(res)
            }
        })
    })

    return await s3.upload({
        Bucket: event.Bucket,
        Key: event.Key,
        Body: res,
        ContentType: event.ContentType,
    }).promise()
}
