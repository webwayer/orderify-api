import * as pkgcloud from 'pkgcloud'
import * as pkgcloudlocal from 'filesystem-storage-pkgcloud'

export function pkgcloudFactory() {
    (<any>pkgcloud).providers.filesystem = {};
    (<any>pkgcloud).providers.filesystem.storage = pkgcloudlocal

    const storageClient = pkgcloud.storage.createClient(<any>{
        provider: 'filesystem',
        root: './storage',
    })

    return storageClient
}