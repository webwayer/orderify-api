import { Dialect, Sequelize, Model, DataTypes } from 'sequelize'

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

export { Model, DataTypes } from 'sequelize'

export interface IDatabase {
    sequelize: Sequelize
    Model: typeof Model
    DataTypes: typeof DataTypes
}

export interface IDatabaseConfig {
    DATABASE_NAME: string
    DIALECT: string
    HOST: string
    PASSWORD: string
    PORT: string
    USER: string
}
