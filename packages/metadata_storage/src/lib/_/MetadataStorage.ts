import { IMetadata, IMetadataProps } from './_/Metadata'

export class MetadataStorage {
    constructor(
        private Metadata: IMetadata,
        private source: IMetadataProps['source'],
        private sourceType: IMetadataProps['sourceType'],
        private instanceType: IMetadataProps['instanceType'],
    ) { }

    public async bulkCreate(objs: IMetadataObj[]) {
        return this.Metadata.bulkCreate(objs.map(obj => ({
            ...obj,
            source: this.source,
            sourceType: this.sourceType,
            instanceType: this.instanceType,
        })))
    }

    public async create(obj: IMetadataObj) {
        return this.Metadata.create({
            ...obj,
            source: this.source,
            sourceType: this.sourceType,
            instanceType: this.instanceType,
        })
    }

    public build(obj: IMetadataObj) {
        return this.Metadata.build({
            ...obj,
            source: this.source,
            sourceType: this.sourceType,
            instanceType: this.instanceType,
        })
    }

    public async findByUserId(userId: string) {
        const metadatas = await this.Metadata.findAll({
            where: {
                userId,
                source: this.source,
                sourceType: this.sourceType,
                instanceType: this.instanceType,
            },
        })

        return metadatas.map(metadata => metadata.data)
    }

    public async findByInstanceId(instanceId: string) {
        const metadata = await this.Metadata.findOne({
            where: {
                instanceId,
                source: this.source,
                sourceType: this.sourceType,
                instanceType: this.instanceType,
            },
        })

        return metadata?.data
    }

    public async updateByInstanceId(instanceId: string, data: any) {
        return this.Metadata.updateOne({
            data,
        }, {
            where: {
                instanceId,
                source: this.source,
                sourceType: this.sourceType,
                instanceType: this.instanceType,
            },
        })
    }
}

interface IMetadataObj {
    userId: string
    instanceId: string
    data: any
}
