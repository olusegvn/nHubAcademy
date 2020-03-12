const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Student = require('../models/student')
const Intern = require("../models/intern")
const AcceptedStudent = require('../models/acceptedStudent')
const { isUserAuthenticated } = require("../config/customFunctions")
const mailer = require("../misc/mailer");
const StudentSignIn  = require('../models/studentSignIn')
const StudentSignOut = require('../models/studentSignOut')
const StudentExeat = require("../models/studentExeat")
const async = require("async")
var crypto = require("crypto")



// router.all('/*', isUserAuthenticated, (req, res, next) => {

//     req.app.locals.layout = 'default';

//     next();
// });
module.exports = {
    // ========================================  attendance SIgnIn Post =======================================
    signInPost:(req,res)=>{
        Student.findById(req.params.id).then(student =>{
           let newSignIn = new StudentSignIn({
               fullName: student.fullName,
               studentId: student.studentId,
           })
           newSignIn.save().then(newSignIn =>{
               req.flash('success',`${newSignIn.fullName}, Thank You For Signing In Today`)
               return res.redirect('back')
           }).catch((err)=>{
               console.log(err)
               req.flash('error','Something Went Wrong, Please Try Again')
               return res.redirect('back')
           })
        })
    },
    // ========================================  attendance SIgn Out Post =======================================
    signOutPost: (req, res) => {
        Student.findById(req.params.id).then(student => {
            let newSignOut = new StudentSignOut({
                fullName: student.fullName,
                studentId: student.studentId,
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
    // =========================================== Render profile ========================================
    profileGet:(req,res)=>{
        Student.findById(req.user._id).then(student => {
            console.log(student)
            // const fullName = student.firstName + ' ' + student.lastName
            const date = new Date();
            console.log(date)
            let pageTitle = student.fullName;
            res.render("students/profile", { layout: 'studentsLayout', pageTitle, student: student, date});
        })
    },
    // =========================================     REGISTRATION  ===============================================
    registerPost: async (req, res) => {
        console.log(req.body)
        let { email, phoneNumber, firstName,userType, lastName, password, identityNumber, confirmPassword } = req.body;

        let newStudent = new Student({ email, phoneNumber, firstName, identityNumber, userType, lastName, password, confirmPassword })
        // Checking the database if email is taken
        console.log(newStudent)
        await Student.findOne({ 'email': newStudent.email }, async (err, student) => {
            // If email is taken  
            if (student) {
                req.flash('error', 'Email is already used.');
                return res.redirect('back');

            }
        await  Intern.findOne({'email': newStudent.email}, (err,intern)=>{
            if(intern){
                req.flash('error', 'Email is already used.');
                return res.redirect('back');
            }
        })
            // Checking the database if identity number exists

            await AcceptedStudent.findOne({ 'identityNumber': newStudent.identityNumber }, async (err, student) => {
                // If email is taken  
                if (!student) {
                    req.flash('error', 'Invalid Identity Number');
                    return res.redirect('back');

                }})
            // Comparison of passwords
            if (newStudent.password !== newStudent.confirmPassword) {
                req.flash('error', 'Passwords Do Not Match.');
                return res.redirect('back');

            }
            //delete confirm password
            newStudent.confirmPassword = undefined;
            // Hash the password
            const hash = await Student.hashPassword(newStudent.password);
            newStudent.password = hash;
            // saving user to database
            await newStudent.save().then(console.log(newStudent)).catch(err => console.log(err.message))
            req.flash('success', 'Registration Successful')
            res.redirect('/')



        });
    },
    //============================================================ RESEST PASSWORD POST =======================================
    resetPasswordPost: async (req, res, next) => {
        try {

            await Student.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, student) {
                if (!student) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirmPassword) {

                    student.resetPasswordToken = undefined;
                    student.resetPasswordExpires = undefined;
                    console.log('password reset credentials::', req.body);

                    bcrypt.genSalt(10, (err, salt) => {

                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            req.body.password = hash;
                            student.password = hash;
                            student.save().then((user) => {
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
                const confirmationEmail = `Hello ${student.fullName},
            <br/>
            This is a confirmation that the password for your account ${student.email}   has just been changed.
            <br/>
            <br/>
            <strong>Best Regards!</strong>`

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', student.email, 'Your Password Has Been Changed', confirmationEmail);
            }
            );

        } catch (error) {
            next(error);
        }
    },
    // ======================================================== FORGOT PASSWORD GET ===============================
    forgotPasswordGet: (req, res) => {
        res.render('students/forgotPassword')
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
                Student.findOne({ email: req.body.email }, (err, student) => {
                    if (!student) {
                        req.flash("error", 'No account with that email address exists.')
                        return res.redirect('back');
                    }
                    student.resetPasswordToken = token;
                    student.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    // save(update) user
                    student.save((err) => {
                        done(err, token, student);
                        if (err) { console.log("error while saving intern: ", err) }
                    });
                })
            },
            (token, student, done, err) => {
                // Create email
                const forgotEmail = `Hello ${student.firstName},
      <br/>
      <br>
      You are receiving this because you (or someone else) have requested the reset of the password for your account.
      <br/>
       Kindly  <a href="http://${req.headers.host}/students/resetPassword/${token}">CLICK HERE</a> to complete the process:
      <br/>
      
      <br/>
      If you did not request this, please ignore this email and your password will remain unchanged.
      <br><br>
      <strong>Thank You!</strong>
      `

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', req.body.email, 'Reset Your Password', forgotEmail);

                req.flash('success', 'An e-mail has been sent to ' + student.email + ' with further instructions.');
                done(err, 'done');

            }
        ], (err) => {
            if (err) return next(err);
            res.redirect("/students/forgotPassword")
        }
        )
    },
    // ============================================================   RESET PASSWORD GET =====================================
    resetPasswordGet: (req, res) => {
        Student.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, student) {
            if (!student) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/students/forgotPassword');
            }
            res.render('students/resetPassword', {
                token: req.params.token,

            });
        });
    },
    // ===========================================  exeat ==========================================
    exeatPost:(req,res)=>{
        console.log(req.body)
        Student.findById(req.params.id).then(student =>{
            let newExeat = new StudentExeat({
                timeTo: req.body.timeTo,
                timeFrom: req.body.timeFrom,
                reason: req.body.reason,
                studentId: student.studentId,
                fullName: student.fullName,
                email: student.email
            })
            newExeat.save().then(newExeat =>{
                console.log('exeat saved:',newExeat)
                req.flash('success','Your Request Has Been Submitted')
                res.redirect('back')
            }).catch(err =>{
                console.log(err)
                req.flash('error','Something Went Wrong Please Try Again')
                return res.redirect('back')
            })
        })
    },
    // =========================================================   LOG OUT ================================
    logoutGet: (req, res) => {

        req.logout();
        req.flash("success", "successfully logged out");
        res.redirect("/");
    }


}