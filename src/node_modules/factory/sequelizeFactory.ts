import { Sequelize, Dialect } from 'sequelize'

export function sequelizeFactory(CONFIG: DATABASE_CONFIG) {
    return new Sequelize(
        CONFIG.DATABASE_NAME,
        CONFIG.USER,
        CONFIG.PASSWORD, {
            "dialect": <Dialect>CONFIG.DIALECT,
            "host": CONFIG.HOST,
            "port": parseInt(CONFIG.PORT),
        }
    )
}

export interface DATABASE_CONFIG {
    DIALECT: string,
    DATABASE_NAME: string,
    USER: string,
    PASSWORD: string,
    HOST: string,
    PORT: string,
}