import { Sequelize } from 'sequelize'

interface IDatabaseConfig {
    DATABASE_NAME: string
    HOST: string
    PASSWORD: string
    PORT: string
    USER: string
}

export function sequelizeFactory(CONFIG: IDatabaseConfig) {
    return new Sequelize(
        CONFIG.DATABASE_NAME,
        CONFIG.USER,
        CONFIG.PASSWORD, {
        dialect: 'postgres',
        host: CONFIG.HOST,
        port: parseInt(CONFIG.PORT, 10),
    })
}

export interface ISSStaticRead<I, ITimestamps, IID = ISSDefaultId> {
    findByPk(pk: string): Promise<ISSFullInstance<I & IID & ITimestamps>>
    findAll(options: ISSFindOptions<ISSInstanceProps<I & IID & ITimestamps>>):
        Promise<Array<ISSFullInstance<I & IID & ITimestamps>>>
    findOne(options: ISSFindOptions<ISSInstanceProps<I & IID & ITimestamps>>):
        Promise<ISSFullInstance<I & IID & ITimestamps>>
}
export interface ISSStaticWrite<I, ITimestamps, IID = ISSDefaultId> {
    build(instance: I): ISSFullInstance<I & IID & ITimestamps>
    create(instance: I & Partial<IID>): Promise<ISSFullInstance<I & IID & ITimestamps>>
    update(instance: Partial<I>, options: ISSFindOptions<ISSInstanceProps<I & IID & ITimestamps>>): Promise<void>
    bulkCreate(instances: Array<I & Partial<IID>>): Promise<Array<ISSFullInstance<I & IID & ITimestamps>>>
}

export interface ISSDefaultId {
    id: string
}
export interface ISSTimestamps {
    updatedAt: Date
    createdAt: Date
}
export interface ISSTimestampsParanoid extends ISSTimestamps {
    deletedAt: Date
}

type ISSFullInstance<I> = ISSInstanceMethods<I> & ISSInstanceProps<I>
type ISSInstanceProps<I> = Readonly<I>
interface ISSInstanceMethods<I> {
    toJSON(): ISSInstanceProps<I>
}

interface ISSFindOptions<I> {
    where?: Partial<I>
}
