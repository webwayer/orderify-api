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

export { Model as SequelizeModel, DataTypes as SequelizeDataTypes, Sequelize as SequelizeType } from 'sequelize'

export interface IDatabase {
    sequelize: Sequelize
    Model: typeof Model
    DataTypes: typeof DataTypes
}

interface IDatabaseConfig {
    DATABASE_NAME: string
    DIALECT: string
    HOST: string
    PASSWORD: string
    PORT: string
    USER: string
}

export interface ISSStatic<I> {
    findByPk(pk: number): Promise<ISSFullInstance<I>>
    findAll(options: ISSFindOptions<ISSInstanceProps<I>>): Promise<Array<ISSFullInstance<I>>>
    findOne(options: ISSFindOptions<ISSInstanceProps<I>>): Promise<ISSFullInstance<I>>
    create(instance: I): Promise<ISSFullInstance<I>>
    update(instance: Partial<I>, options: ISSFindOptions<ISSInstanceProps<I>>): Promise<void>
    bulkCreate(instances: I[]): Promise<Array<ISSFullInstance<I>>>
}
interface ISSDefaultProperties {
    id: number
    updatedAt: Date
    createdAt: Date
}
type ISSFullInstance<I> = ISSInstanceMethods<I> & ISSInstanceProps<I>
type ISSInstanceProps<I> = Readonly<I & ISSDefaultProperties>
interface ISSInstanceMethods<I> {
    toJSON(): ISSInstanceProps<I>
}
interface ISSFindOptions<I> {
    where?: Partial<I>
}
