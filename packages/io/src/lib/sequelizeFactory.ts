import { Sequelize } from 'sequelize'

interface IDatabaseConfig {
    DATABASE_NAME: string
    HOST: string
    PASSWORD: string
    PORT: string
    USER: string
}

export function SequelizeFactory(CONFIG: IDatabaseConfig) {
    return new Sequelize(
        CONFIG.DATABASE_NAME,
        CONFIG.USER,
        CONFIG.PASSWORD, {
        dialect: 'postgres',
        host: CONFIG.HOST,
        port: parseInt(CONFIG.PORT, 10),
        logging: false,
    })
}
