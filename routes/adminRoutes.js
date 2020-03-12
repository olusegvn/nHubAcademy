const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Admin = require('../models/admin');
const adminController = require("../controllers/adminController");
const { isUserAuthenticated } = require("../config/customFunctions");
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
// ====================================================== approve internship appliaction ==================
router.route('/approveInternshipApplication/:id')
.post(adminController.approveInternshipApplicationPost)
// ==================================================== delete internship application =====================
router.route('/deleteInternshipApplication/:id')
    .delete(isUserAuthenticated,adminController.deletePost);

// =================================================== internship application ===========================
router.route('/internshipApplications')
    .get(isUserAuthenticated,adminController.internshipApplicationsGet)
// ========================================================  PROFILE ==============================
router.route('/profile')
    .get(isUserAuthenticated,adminController.profileGet)
// ========================================================   DASHBOARD =====================================
router.route('/dashboard')
    .get(isUserAuthenticated,adminController.dashboardGet)
// ================================================== exeat =====================================
// ================================================== student exeat =====================================
router.route('/studentExeat')
    .get(isUserAuthenticated,adminController.studentExeat)
// ================================================== student exeat =====================================
router.route('/internExeat')
    .get(isUserAuthenticated,adminController.internExeat)
// ==================================================  APPROVE INTERN EXIT REQUESTS =====================
router.route('/approveInternExeat/:id')
    .post(isUserAuthenticated,adminController.approveInternExeat)
// ==================================================  reject  and delete INTERN EXIT REQUESTS =====================
router.route('/rejectInternExeat/:id')
    .delete(isUserAuthenticated,adminController.rejectInternExeat)
// ==================================================== ALL INTERNS  GET ===============================================
router.route('/allInterns')
    .get(isUserAuthenticated,adminController.allInternsGet)
// =================================================== ALL STUSENTS GET
router.route('/allStudents')
    .get(isUserAuthenticated,adminController.allStudentsGet)
    // ==============================================================================================
// ==================================================  APPROVE Student EXIT REQUESTS =====================
router.route('/approveStudentExeat/:id')
    .post(isUserAuthenticated,adminController.approveStudentExeat)
// ==================================================  reject  and delete student EXIT REQUESTS =====================
router.route('/rejectStudentExeat/:id')
    .delete(isUserAuthenticated,adminController.rejectStudentExeat)
// ================================================= CLEAR INTERN EXEATS ========================================
router.route('/deleteAllInternExeatRequests')
    .post(isUserAuthenticated,adminController.deleteInternExeatRequests)
// ================================================= CLEAR Student EXEATS ========================================
router.route('/deleteAllStudentExeatRequests')
    .post(isUserAuthenticated,adminController.deleteStudentExeatRequests)
// ================================================= CLEAR interns sign out ========================================

router.route('/deleteAllInternSignOut')
    .post(isUserAuthenticated,adminController.deleteInternsSignOut)
// ================================================= CLEAR students sign out ========================================

router.route('/deleteAllStudentsSignOut')
    .post(isUserAuthenticated,adminController.deleteStudentsSignOut)
// ================================================= CLEAR interns sign in ========================================

router.route('/deleteAllInternsSignIn')
    .post(isUserAuthenticated,adminController.deleteInternsSignIn)
// ================================================= CLEAR students sign in ========================================

router.route('/deleteAllStudentsSignIn')
    .post(isUserAuthenticated,adminController.deleteStudentsSignIn)


// ========================================= Forgot password ==============================================
router.route('/forgotPassword')
    .get(adminController.forgotPasswordGet)
    .post(adminController.forgotPasswordPost);
// ======================================= reset password =================================================
router.route('/resetPassword/:token')
    .get(adminController.resetPasswordGet)
    .post(adminController.resetPasswordPost);
// ================================================  student signIn =====================================
router.route('/studentSignIn')
    .get(isUserAuthenticated,adminController.studentSignInGet)
// ================================================  student sign out =====================================
router.route('/studentSignOut')
    .get(isUserAuthenticated,adminController.studentSignOutGet)
// ================================================  intern sign out =====================================
router.route('/internSignIn')
    .get(isUserAuthenticated,adminController.internSignInGet)
// ===============================================  intern sign out =====================================
router.route('/internSignOut')
    .get(isUserAuthenticated,adminController.internSignOutGet)
// ===================================================== CLEAR INTERNSHIP APPLICATIOINS ==================
router.route('/deleteAllInternshipApplications')
    .post(isUserAuthenticated,adminController.deleteInternshipApplications)
    // =========================================== change pic ===========================================
    router.route('/changePic/:id')
        .post(isUserAuthenticated,
        upload.single('profilePic'),function (req,res,next){
            console.log(req.file)
            Admin.findById(req.params.id).then(admin=>{
                cloudinary.v2.uploader.upload(req.file.path, async(err,result)=>{
                    admin.profilePicture = result.secure_url;
                    await admin.save().then(admin=>{
                        req.flash('success',`profile Picture for ${admin.firstName} has been updated`)
                        return res.redirect('back')
                    }).catch((err)=>{
                        console.log(err)
                        req.flash('error','Something Went Wrong Please Try Again')
                        return res.redirect('back')
                    })
                })
            })
        }
    )
// =============================================        logout ==================================================
router.route('/logout')
    .get(isUserAuthenticated,adminController.logoutGet)

// =======================================================CONFIGURE PASSPORT ===============================
// passport.use(new LocalStrategy({ 
//     usernameField: 'email',
//     passReqToCallback: true
// }, (req, email, password, done) => {
//     Admin.findOne({ email: email }).then(admin => {
//         if (!admin) {
//             return done(null, false, req.flash('error', 'No Admin Found  With This Email.'));
//         }

//         bcrypt.compare(password, admin.password, (err, passwordMatched) => {
//             if (err) {
//                 return err;
//             }

//             if (!passwordMatched) {
//                 return done(null, false, req.flash('error', 'Invalid Password'));
//             }

//             return done(null, admin, req.flash('success', 'Login Successful'));
//         });

//     });
// }));

// passport.serializeUser(function (admin, done) {
//     done(null, admin.id);
// });

// passport.deserializeUser(function (id, done) {
//     Admin.findById(id, function (err, admin) {
//         done(err, admin);
//     });
// });
// // =============================================LOGIN ROUTE ====================================
// router.route('/login')
//     .post(passport.authenticate('local', {
//         successRedirect: '/admin/profile',
//         failureRedirect: '/',
//         failureFlash: true,
//         successFlash: true,
//         session: true
//     }));







module.exports = router;

