const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const multer = require("multer");
const cloudinary = require("cloudinary");
const Student = require('../models/student')
const studentsController = require("../controllers/studentsController")
const { isUserAuthenticated } = require("../config/customFunctions")

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
// ======================================================= Profile GEt =======================
router.route('/profile')
    .get(isUserAuthenticated,studentsController.profileGet)

// ======================================================   REGISTRATION ===================================
router.route('/register')
.post(studentsController.registerPost)

// ========================================= Forgot password ==============================================
router.route('/forgotPassword')
    .get(studentsController.forgotPasswordGet)
    .post(studentsController.forgotPasswordPost);
// ======================================= reset password =================================================
router.route('/resetPassword/:token')
    .get(studentsController.resetPasswordGet)
    .post(studentsController.resetPasswordPost);
// ======================================================   ATTENDANCE SIGN in ==========================
router.route('/signIn/:id')
    .post(isUserAuthenticated,studentsController.signInPost)
// ======================================================   ATTENDANCE SIGN out ==========================
router.route('/signOut/:id')
    .post(isUserAuthenticated,studentsController.signOutPost)
    // =============================================   EXEAT POST =================================
    router.route('/exeat/:id')
        .post(isUserAuthenticated,studentsController.exeatPost)
// =========================================== change pic ===========================================
router.route('/changePic/:id')
    .post(isUserAuthenticated,
        upload.single('profilePic'), function (req, res, next) {
            console.log(req.file)
            Student.findById(req.params.id).then(student => {
                cloudinary.v2.uploader.upload(req.file.path, async (err, result) => {
                    student.profilePicture = result.secure_url;
                    await student.save().then(student => {
                        req.flash('success', `profile Picture for ${student.fullName} has been updated`)
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

// ================================= Log out ===================================
router.route('/logout')
    .get(isUserAuthenticated,studentsController.logoutGet)








module.exports = router;
