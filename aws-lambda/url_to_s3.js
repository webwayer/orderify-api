const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const https = require('https')

exports.handler = (event, context, callback) => {
    https.get(event.Url, (res) => {
        if (res.statusCode !== 200) { return callback(res.statusCode) }

        s3.upload({
            Bucket: event.Bucket,
            Key: event.Key,
            Body: res,
            ContentType: event.ContentType,
        }, callback)
    })
}
