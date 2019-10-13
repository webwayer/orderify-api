import { Sequelize, Op, Model, ModelCtor } from 'sequelize'

interface IDefaultReadonly {
    id: string,
    updatedAt: Date,
    createdAt: Date,
}

export function simpleSequelizeModelFactory<I extends object, IReadonly = IDefaultReadonly>(
    model,
): IModel<I, IReadonly> {
    return {
        findByPk: async pk => (await model.findByPk(pk))?.toJSON(),
        findOne: async ops => (await model.findOne(ops))?.toJSON(),
        findAll: async ops => (await model.findAll(ops)).map(i => i.toJSON()),
        build: i => model.build(i).toJSON(),
        create: async i => (await model.create(i)).toJSON(),
        update: async (i, ops) => (await model.update(i, ops)),
        bulkCreate: async is => (await model.bulkCreate(is)).map(i => i.toJSON()),
    }
}

interface IModel<I extends object, IReadonly = IDefaultReadonly> {
    findByPk: (pk: string) => Promise<Readonly<I & IReadonly>>
    findOne: (ops: ISSFindOptions<I & IReadonly>) => Promise<Readonly<I & IReadonly>>
    findAll: (ops: ISSFindOptions<I & IReadonly>) => Promise<Array<Readonly<I & IReadonly>>>
    build: (i: I) => Readonly<I & IReadonly>
    create: (i: I) => Promise<Readonly<I & IReadonly>>
    update: (i: Partial<I>, ops: ISSFindOptions<I & IReadonly>) => Promise<void>
    bulkCreate: (is: I[]) => Promise<Array<Readonly<I & IReadonly>>>
}

interface ISSFindOptions<I> {
    where: {
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
