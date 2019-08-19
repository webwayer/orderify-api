import { Router } from 'express'
import { PassportStatic } from 'passport'

export function authenticatedRouterFactory(passport: PassportStatic) {
    const router = Router();

    router.use(passport.initialize());
    router.use(passport.session());

    router.get('/auth/facebook', passport.authenticate('facebook'))
    router.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/auth/facebook'
    }))

    router.use(function (req, res, next) {
        if (!req.session.passport) {
            return res.redirect('/auth/facebook')
        }
        next()
    })

    return router;
}