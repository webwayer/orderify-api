const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const https = require('https')

exports.handler = (event, context, callback) => {
    https.get(event.queryStringParameters.Url, (res) => {
        if (res.statusCode !== 200) { return callback(res.statusCode) }

        s3.upload({
            Bucket: process.env.BUCKET_NAME || event.queryStringParameters.Bucket,
            Key: event.queryStringParameters.Key,
            Body: res
        }, (err2, result) => {
            if (err2) { return callback(err2) }

            callback(null, {
                "statusCode": 200
            })
        })
    })
}

const event = {
    // "body": "eyJ0ZXN0IjoiYm9keSJ9",
    // "resource": "/{proxy+}",
    // "path": "/path/to/resource",
    // "httpMethod": "POST",
    // "isBase64Encoded": true,
    // "queryStringParameters": {
    //     "foo": "bar"
    // },
    "queryStringParameters": {
        "Key": "1",
        "Bucket": "orderify-test-images",
        "Url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Google_Images_2015_logo.svg/1200px-Google_Images_2015_logo.svg.png",
    },
    // "multiValueQueryStringParameters": {
    //     "foo": [
    //         "bar"
    //     ]
    // },
    // "pathParameters": {
    //     "proxy": "/path/to/resource"
    // },
    // "stageVariables": {
    //     "baz": "qux"
    // },
    // "headers": {
    //     "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    //     "Accept-Encoding": "gzip, deflate, sdch",
    //     "Accept-Language": "en-US,en;q=0.8",
    //     "Cache-Control": "max-age=0",
    //     "CloudFront-Forwarded-Proto": "https",
    //     "CloudFront-Is-Desktop-Viewer": "true",
    //     "CloudFront-Is-Mobile-Viewer": "false",
    //     "CloudFront-Is-SmartTV-Viewer": "false",
    //     "CloudFront-Is-Tablet-Viewer": "false",
    //     "CloudFront-Viewer-Country": "US",
    //     "Host": "1234567890.execute-api.eu-central-1.amazonaws.com",
    //     "Upgrade-Insecure-Requests": "1",
    //     "User-Agent": "Custom User Agent String",
    //     "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
    //     "X-Amz-Cf-Id": "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA==",
    //     "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
    //     "X-Forwarded-Port": "443",
    //     "X-Forwarded-Proto": "https"
    // },
    // "multiValueHeaders": {
    //     "Accept": [
    //         "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    //     ],
    //     "Accept-Encoding": [
    //         "gzip, deflate, sdch"
    //     ],
    //     "Accept-Language": [
    //         "en-US,en;q=0.8"
    //     ],
    //     "Cache-Control": [
    //         "max-age=0"
    //     ],
    //     "CloudFront-Forwarded-Proto": [
    //         "https"
    //     ],
    //     "CloudFront-Is-Desktop-Viewer": [
    //         "true"
    //     ],
    //     "CloudFront-Is-Mobile-Viewer": [
    //         "false"
    //     ],
    //     "CloudFront-Is-SmartTV-Viewer": [
    //         "false"
    //     ],
    //     "CloudFront-Is-Tablet-Viewer": [
    //         "false"
    //     ],
    //     "CloudFront-Viewer-Country": [
    //         "US"
    //     ],
    //     "Host": [
    //         "0123456789.execute-api.eu-central-1.amazonaws.com"
    //     ],
    //     "Upgrade-Insecure-Requests": [
    //         "1"
    //     ],
    //     "User-Agent": [
    //         "Custom User Agent String"
    //     ],
    //     "Via": [
    //         "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)"
    //     ],
    //     "X-Amz-Cf-Id": [
    //         "cDehVQoZnx43VYQb9j2-nvCh-9z396Uhbp027Y2JvkCPNLmGJHqlaA=="
    //     ],
    //     "X-Forwarded-For": [
    //         "127.0.0.1, 127.0.0.2"
    //     ],
    //     "X-Forwarded-Port": [
    //         "443"
    //     ],
    //     "X-Forwarded-Proto": [
    //         "https"
    //     ]
    // },
    // "requestContext": {
    //     "accountId": "123456789012",
    //     "resourceId": "123456",
    //     "stage": "prod",
    //     "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
    //     "requestTime": "09/Apr/2015:12:34:56 +0000",
    //     "requestTimeEpoch": 1428582896000,
    //     "identity": {
    //         "cognitoIdentityPoolId": null,
    //         "accountId": null,
    //         "cognitoIdentityId": null,
    //         "caller": null,
    //         "accessKey": null,
    //         "sourceIp": "127.0.0.1",
    //         "cognitoAuthenticationType": null,
    //         "cognitoAuthenticationProvider": null,
    //         "userArn": null,
    //         "userAgent": "Custom User Agent String",
    //         "user": null
    //     },
    //     "path": "/prod/path/to/resource",
    //     "resourcePath": "/{proxy+}",
    //     "httpMethod": "POST",
    //     "apiId": "1234567890",
    //     "protocol": "HTTP/1.1"
    // }
}

exports.handler(event, {}, (err, result) => {
    if (err) {
        console.error(err)
    } else {
        console.log(result)
    }
})