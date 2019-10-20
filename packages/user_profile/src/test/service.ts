import dotenv from 'dotenv'
dotenv.config()

import { SequelizeFactory, updateConfig, IO_CONFIG, graphqlSchemaFactory } from '@orderify/io'

import { userProfileServiceFactory } from '..'

export const sequelize = SequelizeFactory(updateConfig(IO_CONFIG, process.env).DATABASE)

export const {
    User,
    userProfile,
    userProfileGraphql,
} = userProfileServiceFactory(sequelize)

export const schema = graphqlSchemaFactory(userProfileGraphql)
