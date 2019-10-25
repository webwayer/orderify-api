import { Sequelize, Op } from 'sequelize'

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
        bulkCreate: async is => (await model.bulkCreate(is)).map(i => i.toJSON()),
        update: async (i, ops) => (await model.update(i, { ...ops, returning: true }))[1].map(ins => ins.toJSON()),
        updateOne: async (i, ops) => (await model.update(i, { ...ops, limit: 1, returning: true }))[1][0]?.toJSON(),
        destroyById: async id => !!await model.destroy({ where: { id } }),
        destroy: async ops => await model.destroy(ops),
    }
}

interface IModel<I extends object, IReadonly = IDefaultReadonly> {
    findByPk: (pk: string) => Promise<Readonly<I & IReadonly>>
    findOne: (ops: ISSFindOptions<I & IReadonly>) => Promise<Readonly<I & IReadonly>>
    findAll: (ops: ISSFindOptions<I & IReadonly>) => Promise<Array<Readonly<I & IReadonly>>>
    build: (i: I & Partial<IReadonly>) => Readonly<I & IReadonly>
    create: (i: I & Partial<IReadonly>) => Promise<Readonly<I & IReadonly>>
    update: (i: Partial<I>, ops: ISSFindOptions<I & IReadonly>) => Promise<Array<Readonly<I & IReadonly>>>
    updateOne: (i: Partial<I>, ops: ISSFindOptions<I & IReadonly>) => Promise<Readonly<I & IReadonly>>
    bulkCreate: (is: Array<I & Partial<IReadonly>>) => Promise<Array<Readonly<I & IReadonly>>>
    destroyById: (pk: string) => Promise<boolean>
    destroy: (ops: ISSFindOptions<I & IReadonly>) => Promise<void>
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
    } & {
        [Op.or]?: {
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
        },
    }
    order?: string[] | ReturnType<typeof Sequelize.literal>
    limit?: number
}
