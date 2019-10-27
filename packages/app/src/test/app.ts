import { updateConfig, SequelizeFactory } from '@orderify/io'
import { appFactory, DEFAULT_APP_CONFIG } from '..'

const CONFIG = updateConfig(DEFAULT_APP_CONFIG, process.env)
const config = updateConfig(CONFIG, {
    COSTS_CAMPAIGN_COST: '5',
    COMPARISONS_TO_FINISH: '2',
    OAUTH_DEV_EMAILS: '1',
})

export const sequelize = SequelizeFactory(config.DATABASE)
export const { app, Album, Image, Campaign } = appFactory(config, sequelize, {
    async url_to_s3() { return },
})
