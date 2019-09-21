import { Dialect, Sequelize } from "sequelize"

export function sequelizeFactory(CONFIG: IDatabaseConfig) {
    return new Sequelize(
        CONFIG.DATABASE_NAME,
        CONFIG.USER,
        CONFIG.PASSWORD, {
        dialect: CONFIG.DIALECT as Dialect,
        host: CONFIG.HOST,
        port: parseInt(CONFIG.PORT, 10),
    })
}

export type IDatabase = Sequelize

export interface IDatabaseConfig {
    DATABASE_NAME: string
    DIALECT: string
    HOST: string
    PASSWORD: string
    PORT: string
    USER: string
}
