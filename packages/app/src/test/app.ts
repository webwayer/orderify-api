import { updateConfig, SequelizeFactory } from '@orderify/io'
import { appFactory, DEFAULT_APP_CONFIG } from '..'

const CONFIG = updateConfig(DEFAULT_APP_CONFIG, process.env)

export const sequelize = SequelizeFactory(CONFIG.DATABASE)
export const { app } = appFactory(CONFIG, sequelize, {
    async url_to_s3() { return },
})
