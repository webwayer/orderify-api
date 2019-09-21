import { Router } from 'express'
import { photoStorageFactory } from '../../../../../photo_library/photoStorage';
import { photoLibraryFactory } from '../../../../../photo_library/photoLibrary'

export function photosRouterFactory(router: Router, photoStorage: ReturnType<typeof photoStorageFactory>, photoLibrary: ReturnType<typeof photoLibraryFactory>) {
    router.get('/', function (req, res) {
        console.log(req.session)
        res.send('Hello World')
    })

    router.get('/albums', async function (req, res) {
        res.json(await photoLibrary.getAlbumsByUserId(req.session.userId))
    })

    router.get('/photos', async function (req, res) {
        res.json(await photoLibrary.getPhotosByUserId(req.session.userId))
    })

    router.get('/photos/:id/download', async (req, res) => {
        const photo = await photoLibrary.getPhotoById(req.params['id'], req.session.userId)
        if (photo) {
            photoStorage.downloadAsStream(photo.id).pipe(res)
        } else {
            res.end()
        }
    })

    return router;
}