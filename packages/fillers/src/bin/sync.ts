import fs from 'fs'
import path from 'path'

import dotenv from 'dotenv'
dotenv.config()

import { SequelizeFactory, IO_CONFIG, updateConfig, S3Factory } from '@orderify/io'
import { AlbumFactory, ImageFactory, IMAGE_LIBRARY_CONFIG } from '@orderify/image_library'
import { CampaignFactory } from '@orderify/compare_campaigns'

import { syncFillers } from '../'

const io_config = updateConfig(IO_CONFIG, process.env)
const image_library_config = updateConfig(IMAGE_LIBRARY_CONFIG, process.env)

const sequelize = SequelizeFactory(io_config.DATABASE)
const s3 = S3Factory(io_config.AWS)

const Album = AlbumFactory(sequelize)
const Image = ImageFactory(sequelize)
const Campaign = CampaignFactory(sequelize)

async function imageToS3(image: string) {
    return s3.upload({
        Key: image,
        Bucket: image_library_config.STORAGE.BUCKET_NAME,
        ContentType: 'image/jpeg',
        Body: fs.createReadStream(path.normalize(`${__dirname}/../../images/${image}`)),
    }).promise()
}

async function run() {
    await sequelize.sync()
    await syncFillers(
        fs.readdirSync(path.normalize(`${__dirname}/../../images/`)),
        Album,
        Image,
        Campaign,
        imageToS3,
    )

    // tslint:disable-next-line: no-console
    console.log('done')

    await sequelize.close()
}

// tslint:disable-next-line: no-console
run().catch(err => console.error(err))
