const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Intern = require('../models/intern')
const internsController = require("../controllers/internsController")
const { isUserAuthenticated } = require("../config/customFunctions")
const multer = require("multer");
const cloudinary = require("cloudinary");

//==========================================================  set up multer============================
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "-" + Date.now());
    }
});
var upload = multer({ storage: storage })

// ===================================================   CLOUDINARY SETUP =====================================
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret

});
// ================================================== logout =========================================
router.route('/logout')
    .get(isUserAuthenticated,internsController.logoutGet)
// ========================================== profile get  =================================
router.route('/profile')
    .get(isUserAuthenticated,internsController.profileGet)
// ========================================  REGISTRATION  ==================================
router.route('/registration')
    .post(internsController.registerPost)

// ========================================= Forgot password ==============================================
router.route('/forgotPassword')
    .get(internsController.forgotPasswordGet)
    .post(internsController.forgotPasswordPost);
// ======================================= reset password =================================================
router.route('/resetPassword/:token')
    .get(internsController.resetPasswordGet)
    .post(internsController.resetPasswordPost);
// ======================================================   ATTENDANCE SIGN in ==========================
router.route('/signIn/:id')
    .post(isUserAuthenticated,internsController.signInPost)
// ======================================================   ATTENDANCE SIGN out ==========================
router.route('/signOut/:id')
    .post(isUserAuthenticated,internsController.signOutPost)
// =========================================== change pic ===========================================
router.route('/exeat/:id')
    .post(isUserAuthenticated,internsController.exeatPost)
// =============================================  exeat ========================================

router.route('/changePic/:id')
    .post(isUserAuthenticated,
        upload.single('profilePic'), function (req, res, next) {
            console.log(req.body)
            console.log(req.file)
            Intern.findById(req.params.id).then(intern => {
                cloudinary.v2.uploader.upload(req.file.path, async (err, result) => {
                    intern.profilePicture = result.secure_url;
                    await intern.save().then(intern => {
                        req.flash('success', `profile Picture for ${intern.firstName} has been updated`)
                        return res.redirect('back')
                    }).catch((err) => {
                        console.log(err)
                        req.flash('error', 'Something Went Wrong Please Try Again')
                        return res.redirect('back')
                    })
                })
            })
        }
    )
module.exports = router;
