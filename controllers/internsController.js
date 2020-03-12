const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Intern = require('../models/intern')
const AcceptedIntern = require('../models/acceptedIntern')
const Student = require("../models/student")
const InternSignIn = require("../models/internSignIn")
const InternSignOut = require("../models/internSignOut")
const async = require("async")
var crypto = require("crypto")
const mailer = require("../misc/mailer");
const InternExeat = require('../models/internExeat')


const { isUserAuthenticated } = require("../config/customFunctions")

// router.all('/*', isUserAuthenticated, (req, res, next) => {

//     req.app.locals.layout = 'default';

//     next();
// });
module.exports = {
    // ========================================  attendance SIgnIn Post =======================================
    signInPost: (req, res) => {
        Intern.findById(req.params.id).then(intern => {
            console.log('CONC:',intern)
            let newSignIn = new InternSignIn({
                fullName: intern.firstName + ' '+ intern.lastName, 
                internId: intern.internId,
            })
            newSignIn.save().then(newSignIn => {
                req.flash('success', `${newSignIn.fullName}, Thank You For Signing In Today`)
                return res.redirect('back')
            }).catch((err) => {
                console.log(err)
                req.flash('error', 'Something Went Wrong, Please Try Again')
                return res.redirect('back')
            })
        })
    },
    // ========================================  attendance SIgn Out Post =======================================
    signOutPost: (req, res) => {
        Intern.findById(req.params.id).then(intern => {
            let newSignOut = new InternSignOut({
                fullName: intern.firstName + ' ' + intern.lastName,
                internId: intern.internId,
            })
            newSignOut.save().then(newSignOut => {
                req.flash('success', `${newSignOut.fullName}, Thank You For Signing Out Today`)
                return res.redirect('back')
            }).catch((err) => {
                console.log(err)
                req.flash('error', 'Something Went Wrong, Please Try Again')
                return res.redirect('back')
            })
        })
    },
    // =========================================     REGISTRATION  ===============================================
    registerPost: async (req,res)=>{
        console.log(req.body)
        let { email, phoneNumber, firstName, lastName, userType,password,identityNumber, confirmPassword } = req.body;

        let newIntern = new Intern({ email, phoneNumber, userType, firstName, identityNumber, lastName, password, confirmPassword })
        // Checking the database if email is taken
        console.log(newIntern)
        await Intern.findOne({ 'email': newIntern.email }, async (err, intern) => {
            // If email is taken  
            if (intern) {
                req.flash('error', 'Email is already used.');
                return res.redirect('back');

            }
            await Student.findOne({'email':newIntern.email},(err,student)=>{
                if(student){
                    req.flash('error', 'Email is already used.');
                    return res.redirect('back');  
                }
            })
            // Checking the database if identity number exists
            
            await AcceptedIntern.findOne({ 'identityNumber': newIntern.identityNumber }, async (err, intern) => {
                // If email is taken  
                if (!intern) {
                    req.flash('error', 'Invalid Identity Number');
                    return res.redirect('back');

                }})
            // Comparison of passwords
            if (newIntern.password !== newIntern.confirmPassword) {
                req.flash('error', 'Passwords Do Not Match.');
                return res.redirect('back');

            }
            //delete confirm password
            newIntern.confirmPassword = undefined;
            // Hash the password
            const hash = await Intern.hashPassword(newIntern.password);
            newIntern.password = hash;
            // saving user to database
            await newIntern.save().then(console.log(newIntern)).catch(err => console.log(err.message))
            req.flash('success', 'Registration Successful')
            res.redirect('/')
           


        });
    },
    
    //============================================================ RESEST PASSWORD POST =======================================
    resetPasswordPost: async (req, res,next) => {
        try {

            await Intern.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, intern) {
                if (!intern) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirmPassword) {

                    intern.resetPasswordToken = undefined;
                    intern.resetPasswordExpires = undefined;
                    console.log('password reset credentials::', req.body);

                    bcrypt.genSalt(10, (err, salt) => {

                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            req.body.password = hash;
                            intern.password = hash;
                            intern.save().then((user) => {
                                console.log('UPDATED USER::', user);
                            }).catch((err) => {
                                console.log(err)
                            })
                        })
                    })

                    if (err) { console.log(err) }

                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
                req.flash('success', 'Success! Your password has been changed.');
                res.redirect('/');
                // Create email
                const confirmationEmail = `Hello ${intern.firstName},
            <br/>
            This is a confirmation that the password for your account ${intern.email}   has just been changed.
            <br/>
            <br/>
            <strong>Best Regards!</strong>`

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', intern.email, 'Your Password Has Been Changed', confirmationEmail);
            }
            );

        } catch (error) {
            next(error);
        }
    },
    // ======================================================== FORGOT PASSWORD GET ===============================
    forgotPasswordGet: (req, res) => {
        res.render('interns/forgotPassword')
    },
    //  ====================================================== FORGOT PASSWORD POST ===============================
    forgotPasswordPost: (req, res) => {
        async.waterfall([
            (done) => {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            (token, done) => {
                Intern.findOne({ email: req.body.email }, (err, intern) => {
                    if (!intern) {
                        req.flash("error", 'No account with that email address exists.')
                        return res.redirect('back');
                    }
                    intern.resetPasswordToken = token;
                    intern.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    // save(update) user
                    intern.save((err) => {
                        console.log(intern)
                        done(err, token, intern);
                        if (err) { console.log("error while saving intern: ", err) }
                    });
                })
            },
            (token, intern, done, err) => {
                // Create email
                const forgotEmail = `Hello ${intern.firstName},
      <br/>
      <br>
      You are receiving this because you (or someone else) have requested the reset of the password for your account.
      <br/>
       Kindly  <a href="http://${req.headers.host}/interns/resetPassword/${token}">CLICK HERE</a> to complete the process:
      <br/>
      
      <br/>
      If you did not request this, please ignore this email and your password will remain unchanged.
      <br><br>
      <strong>Thank You!</strong>
      `

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', req.body.email, 'Reset Your Password', forgotEmail);

                req.flash('success', 'An e-mail has been sent to ' + intern.email + ' with further instructions.');
                done(err, 'done');

            }
        ], (err) => {
            if (err) return next(err);
            res.redirect("/interns/forgotPassword")
        }
        )
    },
    // ============================================================   RESET PASSWORD GET =====================================
    resetPasswordGet: async(req, res) => {
        await Intern.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, intern) {
            console.log('found :',intern)
            if (!intern) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/interns/forgotPassword');
            }
            res.render('interns/resetPassword', {
                token: req.params.token,

            });
            if (err){console.log(err)}
        });
    },
    // ============================================================ PROFILE ====================================
    profileGet:(req,res)=>{
          Intern.findById(req.user._id).then(intern => {
                console.log(intern)
              const date = new Date();
               const fullName = intern.firstName+ ' '+intern.lastName  
                let pageTitle = fullName;
                res.render("interns/profile", { layout: 'internsLayout',pageTitle, intern:intern,fullName,date });
            })
    },
    // ===========================================  exeat ==========================================
    exeatPost: (req, res) => {
        console.log(req.body)
        Intern.findById(req.params.id).then(intern => {
            let newExeat = new InternExeat({
                timeTo: req.body.timeTo,
                timeFrom: req.body.timeFrom,
                reason: req.body.reason,
                internId: intern.internId,
                fullName: intern.firstName + ' '+ intern.lastName,
                email: intern.email
            })
            newExeat.save().then(newExeat => {
                console.log('exeat saved:', newExeat)
                req.flash('success', 'Your Request Has Been Submitted')
                res.redirect('back')
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something Went Wrong Please Try Again')
                return res.redirect('back')
            })
        })
    },
    // =========================================================   LOG OUT ================================
    logoutGet:(req,res)=>{
        
            req.logout();
            req.flash("success", "successfully logged out");
            res.redirect("/");
    }
    

}