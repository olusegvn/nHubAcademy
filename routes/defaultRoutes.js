const express = require("express");
const router = express.Router();
const defaultController = require("../controllers/defaultController");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const {isUserAuthenticated} = require("../config/customFunctions")
const multer = require("multer");
const cloudinary = require("cloudinary");
const InternshipApplication = require('../models/internshipApplication')
const mailer = require("../misc/mailer");
const Admin = require("../models/admin")
const Intern = require("../models/intern")
const Student = require("../models/student")
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
// ===================================================== RENDER HOMEPAGE =============================
router.route('/')
    .get(defaultController.index)

// // =======================================================CONFIGURE PASSPORT ===============================

// Defining Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {
    Intern.findOne({ email: email }).then(user => {
        if (!user) {
            Student.findOne({ email: email }).then(user => {
                if (!user) {
                    Admin.findOne({ email: email }).then(user=>{
                        
                       if(!user) {
                           return done(null, false, req.flash('error', 'User not found with this email.'));
                        }
                        // if (!user.isActive) {
                        //     return done(null, false, req.flash('error', 'Please go to your mail and active account first'));
                        // }
                        bcrypt.compare(password, user.password, (err, passwordMatched) => {
                            if (err) {
                                return err;
                            }

                            if (!passwordMatched) {
                                return done(null, false, req.flash('error', 'Invalid Password, Please try again'));
                            }

                            return done(null, user, req.flash('success', 'Login Successful'));
                        });

                    })
                  
                }
                // if (!user.isActive) {
                //     return done(null, false, req.flash('error', 'Please go to your mail and active account first'));
                // }

                bcrypt.compare(password, user.password, (err, passwordMatched) => {
                    if (err) {
                        return err;
                    }

                    if (!passwordMatched) {
                        return done(null, false, req.flash('error', 'Invalid Password, Please try again'));
                    }

                    return done(null, user, req.flash('success', 'Login Successful'));
                });
            });
        }
        // if (!user.isActive) {
        //     return done(null, false, req.flash('error', 'Please go to your mail and active account first'));
        // }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
            if (err) {
                return err;
            }

            if (!passwordMatched) {
                return done(null, false, req.flash('error', 'Invalid Password, Please try again'));
            }

            return done(null, user, req.flash('success', 'Login Successful'));
        });
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    Student.findById(id, function (err, user) {
        if (!user) {
            Intern.findById(id, function (err, user) {
                if(!user){
                    Admin.findById(id, function(err,user){
                        done(err, user);   
                    })
                } else { 
                    done(err, user);}

                
            });
        } else {
            done(err, user);
        }
    });

});
router.route('/login')
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true,
        successFlash: true,
        session: true
    }), defaultController.loginPost);
// ================================================APPLICATION FOR INTERNSHIP GET + POST======================
router.route('/internshipApplication')
.get( defaultController.internshipApplicationGet)
    .post( upload.single('applicationLetter'), function (req, res, next) {
        console.log('consoling req.body::', req.body)
        Intern.findOne({'email': req.body.email},(err,intern)=>{
            Student.findOne({'email':req.body.email},(err,student)=>{
                if(student){
                    req.flash('error', 'Email Exits In Ourr Database, Please Try Again With A Different Email')
                    res.redirect('back') 
                }  
            })
            if(intern){
                req.flash('error','Email Exits In Our Database, Please Try Again With A Different Email')
                 res.redirect('back')
            }
        })
        cloudinary.v2.uploader.upload(req.file.path,  async (err, result) =>{
            console.log('consoling cloud result::',result)
            let { institution, startingDate, endingDate, email, firstName, lastName } = req.body;
            var applicationLetter = result.secure_url;
            let newInternshipApplication = new InternshipApplication({ institution, startingDate, endingDate, email, firstName, lastName, applicationLetter })
            console.log(newInternshipApplication)
            await newInternshipApplication.save().then(newApplication =>{
                console.log('consoling promise return::',newApplication)
                req.flash('success', 'Your Application has been Submitted, Check You mail for More information')
                res.redirect('/')
                // Create email
                const html = `Hello ${newInternshipApplication.firstName},
      <br/>
      <br>
      Thank you applying for your internship at nHubAcademy, Your Application has been submitted and has been put up for review.
      <br/>
      You will be contacted through this mail for further Instructions
      <br/><br/>
      <strong>All the best!!!</strong>
      `

                // Sending the mail
        mailer.sendEmail('nhubacademy@gmail.com', newInternshipApplication.email, 'Internship Application Confirmation', html);

            }).catch(err =>  {
                console.log(`${err.message}`)
                req.flash('error', 'Something Went Wrong, Please Try Again')
                return res.redirect('back')
})
if(err) { 
                console.log(err)
                req.flash('error', 'Something Went Wrong, Please Try Again')
                return res.redirect('back')
                }
        })
    });
// ==================================================== COURSES Routes ============================================
router.route('/frontEndDevelopment')
.get(defaultController.frontEndDevelopmentGet)
.post();

router.route('/lampStack')
.get(defaultController.lampStackGet)
.post();

router.route('/introductionToProgramming')
.get(defaultController.introductionToProgrammingGet)
.post();

router.route('/nodeJsFrameWork')
.get(defaultController.nodeJsFrameWorkGet)
.post()

router.route('/meanStack')
.get(defaultController.meanStackGet)
.post();

router.route('/cyberSecurity')
.get(defaultController.cyberSecurityGet)
.post();

router.route('/mobileAppDevelopment')
.get(defaultController.mobileAppDevelopmentGet)
.post();

router.route('/djangoFrameWork')
.get(defaultController.djangoFrameWorkGet)
.post();

router.route('/virtualReality')
    .get(defaultController.virtualRealityGet)
    .post();

router.route('/allCourses')
.get(defaultController.allCoursesGet);

router.route('/about')
.get(defaultController.aboutGet)

router.route('/faq')
    .get(defaultController.faqGet)


//==============================================  subscribe to newsletter =====================================
router.route('/subscribe')
.post(defaultController.subscribePost);
// ================================================    unsubscribe ==================================================
router.route('/unsubscribe/:email')
.get(defaultController.unsubscribeGet);
// =============================================== my accout =====================================
router.route('/myAccount')
.get( isUserAuthenticated, defaultController.myAccountGet)
// ========================================= Forgot password ==============================================
router.route('/forgotPassword')
    .get(defaultController.forgotPasswordGet)
// ================================================ forgot password check post=============================
router.route('/userTypeCheck')
.post(defaultController.userTypeCheckPost)


// ============================================== homepage logout ===============================================
router.route('/logout')
.get(defaultController.logoutGet)











module.exports = router;
