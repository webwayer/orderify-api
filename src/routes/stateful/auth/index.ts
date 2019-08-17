import { Router } from 'express'
import * as passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'

import { router as photosRouter } from './photos'

export const router = Router();

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        cb(null, profile);
    }
))
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

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

router.use(photosRouter);