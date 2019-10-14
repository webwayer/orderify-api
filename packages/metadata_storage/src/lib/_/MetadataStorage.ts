import { IMetadata, IMetadataProps } from './_/Metadata'

export class MetadataStorage {
    constructor(private Metadata: IMetadata) { }

    public async bulkCreate(objs: Parameters<IMetadata['bulkCreate']>[0]) {
        return this.Metadata.bulkCreate(objs)
    }

    public async create(obj: Parameters<IMetadata['create']>[0]) {
        return this.Metadata.create(obj)
    }

    public async updateByInstanceId(
        obj: Parameters<IMetadata['update']>[0],
        instanceId: string,
        instanceType: IMetadataProps['instanceType'],
        source: IMetadataProps['source'],
    ) {
        return this.Metadata.update(obj, {
            where: {
                instanceId,
                instanceType,
                source,
            },
        })
    }

    public build(obj: Parameters<IMetadata['build']>[0]) {
        return this.Metadata.build(obj)
    }

    public async findByUserId(
        userId: string,
        instanceType: IMetadataProps['instanceType'],
        source: IMetadataProps['source'],
    ) {
        return this.Metadata.findAll({
            where: {
                instanceType,
                source,
                userId,
            },
        })
    }
}
