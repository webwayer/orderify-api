import { Model, DataTypes, Sequelize } from 'sequelize';

class Photo extends Model {
    public readonly id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public readonly userId!: string;
    public readonly albumId!: string;

    public readonly name: string;
    public readonly alt_text: string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly link!: string;
    public readonly width!: number;
    public readonly height!: number;
}

export async function PhotoFactory(sequelize: Sequelize, CONFIG: { SYNC_SCHEMAS: string, DROP_ON_SYNC: string }) {
    Photo.init({
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        width: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        height: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: true,
        },
        alt_text: {
            type: new DataTypes.STRING(512),
            allowNull: true,
        },
        link: {
            type: new DataTypes.STRING(256),
            allowNull: false,
        },
        albumId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        }
    }, {
        tableName: 'Photo',
        sequelize
    }
    );

    if (CONFIG.SYNC_SCHEMAS) {
        await Photo.sync({ force: !!CONFIG.DROP_ON_SYNC })
    }

    return Photo;
}

export type PhotoType = typeof Photo
interface PhotoInstance {
    readonly id: number,
    readonly userId: number,
    readonly albumId: number,
    readonly name?: string,
    readonly alt_text?: string,
    readonly link: string,
    readonly width: number,
    readonly height: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;