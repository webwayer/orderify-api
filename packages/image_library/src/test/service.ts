import { SequelizeFactory, IO_CONFIG, updateConfig, graphqlSchemaFactory } from '@orderify/io'

import { imageLibraryServiceFactory } from '..'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)
export const {
    imageLibraryGraphql,
    imageLibraty,
    imageStorage,
    Image,
    Album,
} = imageLibraryServiceFactory({ BUCKET_NAME: 'orderify-test-images' }, sequelize, {
    async url_to_s3() { return },
})

export const schema = graphqlSchemaFactory(imageLibraryGraphql)
