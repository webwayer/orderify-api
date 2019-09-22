import pkgcloud, { storage } from 'pkgcloud'

export function pkgcloudFactory(CONFIG: IStorageConfig) {
    const storageClient = pkgcloud.storage.createClient({
        provider: CONFIG.PROVIDER as any,
        key: CONFIG.KEY,
        keyId: CONFIG.KEY_ID,
        region: CONFIG.REGION,
    })

    return storageClient
}

export type IStorageClient = storage.Client

interface IStorageConfig {
    PROVIDER: string
    KEY: string
    KEY_ID: string
    REGION: string
}
