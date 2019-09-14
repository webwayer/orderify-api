import { Model, DataTypes, Sequelize } from 'sequelize';

export async function FacebookMetadataFactory(sequelize: Sequelize, CONFIG: { SYNC_SCHEMAS: string, DROP_ON_SYNC: string }) {
    class FacebookMetadata extends Model {
        public readonly sourceId!: number;
        public readonly sourceType!: string;
        public readonly data!: any;

        // timestamps!
        public readonly createdAt!: Date;
        public readonly updatedAt!: Date;
    }

    FacebookMetadata.init({
        sourceId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        sourceType: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        data: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    }, {
            tableName: 'FacebookMetadata',
            sequelize
        }
    );

    if (CONFIG.SYNC_SCHEMAS) {
        await FacebookMetadata.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return FacebookMetadata;
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
export type FacebookMetadataType = Unpromise<ReturnType<typeof FacebookMetadataFactory>>