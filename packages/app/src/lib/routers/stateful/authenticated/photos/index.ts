import { Router } from 'express'

import { photoLibraryFactory, photoStorageFactory } from '@orderify/photo_library'

export function photosRouterFactory(
    router: Router,
    photoStorage: ReturnType<typeof photoStorageFactory>,
    photoLibrary: ReturnType<typeof photoLibraryFactory>,
) {
    // router.get('/photos/:id/download', async (req, res) => {
    //     const photo = await photoLibrary.getPhotoById(Number(req.params.id), req.session.userId)
    //     if (photo) {
    //         photoStorage.downloadAsStream(photo.id).pipe(res)
    //     } else {
    //         res.end()
    //     }
    // })

    return router
}
