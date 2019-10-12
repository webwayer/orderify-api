import { Sequelize, Op } from 'sequelize'

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
    update(
        instance: Partial<I>,
        options: ISSFindOptions<ISSInstanceProps<I & IID & ITimestamps>>,
    ): Promise<void>
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
type ISSInstanceProps<I> = Required<Readonly<I>>
interface ISSInstanceMethods<I> {
    toJSON(): ISSInstanceProps<I>
}

interface ISSFindOptions<I> {
    where?: {
        [K in keyof I]?: I[K] | {
            [Op.not]?: I[K]
            [Op.contains]?: I[K],
            [Op.in]?: Array<I[K]>,
        }
    } & {
        [Op.not]?: {
            [KK in keyof I]?: I[KK] | {
                [Op.contains]: I[KK],
            }
        },
    }
    order?: string[] | ReturnType<typeof Sequelize.literal>
    limit?: number
}
