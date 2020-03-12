const express = require("express");
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mailer = require("../misc/mailer");
const InternshipApplications = require('../models/internshipApplication')
const randomString = require("randomstring")
const AcceptedInterns = require("../models/acceptedIntern")
const Intern = require("../models/intern")
const Student = require("../models/student")
const Admin = require('../models/admin')
const StudentSignIn = require('../models/studentSignIn')
const StudentSignOut = require('../models/studentSignOut')
const InternSignIn = require('../models/internSignIn')
const InternSignOut = require('../models/internSignOut')
const StudentExeat = require('../models/studentExeat')
const InternExeat = require('../models/internExeat');
const async = require("async")
var crypto = require("crypto")

module.exports = {
   
    // ================================================ approve internship application  ============================
    approveInternshipApplicationPost:(req,res)=>{
        InternshipApplications.findById(req.params.id)
        .then( application =>{
            
            console.log('foundAplication: ',application)
            if (application.isApproved == true) {
                req.flash('error', 'This Application is Already Approved')
                return res.redirect('back')
            }
            // generate password
            var password = randomString.generate({length:4, charset:'numeric'});
            //generate id number
            var internId = `NA${ randomString.generate({length:4,charset:'numeric'})}`
            // ====================================== send Email ===============

            // Create email
            const mail = `CONGRATS!!! <strong> ${application.firstName}</strong>,
      <br/>
      <br>
      Your internship application has been appproved!!! 
      <br/>
        You can now login in our website, Here are your credentials:
      <br/><br/>
        <strong>INTERN ID: </strong>  <strong>${internId}</strong> <br/>
        <strong>EMAIL: </strong>  <strong>${application.email}</strong> <br/>
        <strong>PASSWORD: </strong>  <strong>${password}</strong>

      <br/>
      <a href="http://${req.headers.host}">CLICK HERE</a> To Visit Our Site
      <br><br>
      <strong>Welcome TO THE HUB!</strong>
      <strong>Best Regards!!!</strong>
      `

            // Sending the mail
            mailer.sendEmail('nhubacademy@gmail.com', application.email, 'Internship Approval', mail);

        // =====================================  end send email =================================================
            // set the found application to approved
            application.isApproved = true;
            application.save();
            // application.remove().then(deletedApplication => { console.log('APPLICATION DELETED!:',deletedApplication) })
            // .catch((err)=>{console.log(err)})
            //create new instance of intern and save
            // hash the password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) { console.log(err); }
                    password = hash;
            let newIntern = new Intern({
                firstName: application.firstName,
                lastName: application.lastName,
                email: application.email,
                internId: internId,
                password:hash,
                userType: 'Intern',
                startingDate: application.startingDate,
                endingDate: application.endingDate,
                applicationLetter: application.applicationLetter,
                institution: application.institution
                
            })
                newIntern.save().then((newintern) => {
                    console.log('consoling New intern', newintern)
                }).catch((err) => { console.log(err) })
            })
            })
            // create new instance of accepted intern
            let newAcceptedIntern = new AcceptedInterns({ 
                email: application.email, internId: internId
             })
             newAcceptedIntern.save().then(intern =>{
                 console.log(intern)
                 req.flash('success','Internship Application Successfully Approved')
                 res.redirect('/admin/internshipApplications')
             })
             


        })
        
    },
    // ==================================================== delete intership appliction ======================
    deletePost:(req,res)=>{
        InternshipApplications.findByIdAndDelete(req.params.id)
            .then(deletedApplication => {
                req.flash('success', `The application by ${deletedApplication.firstName} ${deletedApplication.lastName} has been deleted.`);
                res.redirect('/admin/internshipApplications');
            });
    },
    
    // ===================================================  internship applications ==========================
    internshipApplicationsGet:(req,res)=>{
        InternshipApplications.find().then(internshipApplications =>{
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) =>{
                const fullName = admin.firstName + ' '+ admin.lastName
                pageTitle = 'Internship Applications'
                res.render('admin/internshipApplications', { layout: 'adminLayout', 
                internshipApplications: internshipApplications,admin:admin,fullName:fullName,pageTitle })

            })
        }).catch((e)=> console.log(e))
        
    },
// ======================================================   Profile ==============================================
            profileGet:(req,res)=>{
                Admin.findOne({ firstName: 'Bashir'},(err,admin)=>{
                    console.log(admin)
                    const fullName = admin.firstName + ' ' + admin.lastName
                    pageTitle = fullName
                    res.render('admin/profile', { layout: 'adminLayout', admin: admin,fullName: fullName,pageTitle  })
                })
            },
    // ========================================= dashboard get ==============================================
    dashboardGet: (req, res) => {
        InternshipApplications.countDocuments((err, totalInternshipApplications) => {
            Intern.countDocuments((err, totalInterns) => {
                StudentExeat.countDocuments((err,totalStudentExeatRequests)=>{
                    InternExeat.countDocuments((err,totalInternExeatRequests)=>{
                Student.countDocuments((err, totalStudents) => {
                    Admin.findOne({ firstName: 'Bashir'},(err,admin)=>{
                        const fullName = admin.firstName + ' ' + admin.lastName
                        pageTitle = 'Admin Dashboard'
                    res.render('admin/dashboard',
                        {
                            layout: 'adminLayout',
                            totalInternshipApplications: totalInternshipApplications,
                            totalInterns: totalInterns, totalStudents: totalStudents,
                            admin: admin, fullName: fullName, pageTitle, totalStudentExeatRequests: totalStudentExeatRequests,
                            totalInternExeatRequests: totalInternExeatRequests

                        })
                })
            })
        })
                })
            })
        })
    },
// ============================== =========================================    attendance =============================================
// =========================================== student sign In GET =====================================
    studentSignInGet:(req,res)=>{
        StudentSignIn.find().then(studentsIn => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                pageTitle = 'Signed In Students'
                res.render('admin/studentSignIn', { layout: 'adminLayout', studentsIn: studentsIn, admin: admin, fullName: fullName,pageTitle })

            })
        }).catch((e) => console.log(e))
        
    },
    // =========================================== student sign Out GET =====================================
    studentSignOutGet: (req, res) => {
        StudentSignOut.find().then(studentsOut => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                console.log('consolingfounDIN:',studentsOut)
               let pageTitle= 'Signed Out Students'
                res.render('admin/studentSignOut', { layout: 'adminLayout', studentsOut: studentsOut, admin: admin, fullName: fullName,pageTitle })

            })
        }).catch((e) => console.log(e))

    },
    // =========================================== interns sign In GET =====================================
    internSignInGet: (req, res) => {
        InternSignIn.find().then(internsIn => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                pageTitle = 'Signed In Interns'
                res.render('admin/internSignIn', { layout: 'adminLayout',internsIn: internsIn, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))

    },
    // =========================================== interns sign Out GET =====================================
    internSignOutGet: (req, res) => {
        InternSignOut.find().then(internsOut => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                pageTitle = 'Signed Out Interns'
                res.render('admin/internSignOut', { layout: 'adminLayout', internsOut: internsOut, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))

    },
    

    //============================================================ RESEST PASSWORD POST =======================================
    resetPasswordPost: async (req, res, next) => {
        try {

            await Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, admin) {
                if (!admin) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirmPassword) {

                    admin.resetPasswordToken = undefined;
                    admin.resetPasswordExpires = undefined;
                    console.log('password reset credentials::', req.body);

                    bcrypt.genSalt(10, (err, salt) => {

                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                            req.body.password = hash;
                            admin.password = hash;
                            admin.save().then((admin) => {
                                console.log('UPDATED USER::',admin);
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
                const confirmationEmail = `Hello ${admin.firstName},
            <br/>
            This is a confirmation that the password for your account ${admin.email}   has just been changed.
            <br/>
            <br/>
            <strong>Best Regards!</strong>`

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', admin.email, 'Your Password Has Been Changed', confirmationEmail);
            }
            );

        } catch (error) {
            next(error);
        }
    },
    // ======================================================== FORGOT PASSWORD GET ===============================
    forgotPasswordGet: (req, res) => {
        res.render('admin/forgotPassword')
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
                Admin.findOne({ email: req.body.email }, (err, admin) => {
                    if (!admin) {
                        req.flash("error", 'No account with that email addremss exists.')
                        return res.redirect('back');
                    }
                    admin.resetPasswordToken = token;
                    admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    // save(update) user
                    admin.save((err) => {
                        done(err, token, admin);
                        if (err) { console.log("error while saving admin: ", err) }
                    });
                })
            },
            (token, admin, done, err) => {
                // Create email
                const forgotEmail = `Hello ${admin.firstName},
      <br/>
      <br>
      You are receiving this because you (or someone else) have requested the reset of the password for your account.
      <br/>
       Kindly  <a href="http://${req.headers.host}/admin/resetPassword/${token}">CLICK HERE</a> to complete the process:
      <br/>
      
      <br/>
      If you did not request this, please ignore this email and your password will remain unchanged.
      <br><br>
      <strong>Thank You!</strong>
      `

                // Sending the mail
                mailer.sendEmail('nhubacademy@gmail.com', req.body.email, 'Reset Your Password', forgotEmail);

                req.flash('success', 'An e-mail has been sent to ' + admin.email + ' with further instructions.');
                done(err, 'done');

            }
        ], (err) => {
            if (err) return next(err);
            res.redirect("/admin/forgotPassword")
        }
        )
    },
    // ============================================================   RESET PASSWORD GET =====================================
    resetPasswordGet: (req, res) => {
        Admin.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, admin) {
            if (!admin) {
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('/admin/forgotPassword');
            }
            res.render('admin/resetPassword', {
                token: req.params.token,

            });
        });
    },
    
    // ================================================= all student exeat application =============================
    studentExeat:(req,res)=>{
        StudentExeat.find().then(exeats => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                pageTitle = 'Student Exeat Applications'
                res.render('admin/studentExeats', { layout: 'adminLayout', exeats: exeats, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))
    },
    // ================================== ================= all intern exeat requests ===============================================
    internExeat: (req, res) => {
        InternExeat.find().then(exeats => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                pageTitle = 'Student Exeat Applications'
                res.render('admin/internExeats', { layout: 'adminLayout', exeats: exeats, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))
    },
    // ================================================================ approve intern exeat =========================================
    approveInternExeat:(req,res)=>{
        InternExeat.findById(req.params.id).then(exeat =>{
            if(exeat.isApproved == true){
                req.flash('error','This Request Has Been Approved')
                return res.redirect('back')
            }
           // Create email
            const mail = `CONGRATS!!! <strong> ${exeat.fullName}</strong>,
      <br/>
      <br>
      Your Exeat Request has been appproved!!! 
      <br/>
     <strong>YOUR ARE STRONGLY ADVISED TO RETURN AT THE STATED DATE - ${exeat.timeTo}</strong> <br/>
      <strong>Best Regards!!!</strong>
      `
            // Sending the mail
            mailer.sendEmail('nhubacademy@gmail.com', exeat.email, 'Exeat Approval', mail);

            exeat.isApproved = true;
            exeat.save().then(exeat =>{
                req.flash('success','Approved Successfully')
                return res.redirect('back')
            }).catch(err =>{
                console.log(err)
                req.flash('error','Something Went Wrong Pleasee Try Again')
                return res.redirect('back')
            })

        })
    },
    // ============================================ reject intern exeat ===================================
    rejectInternExeat:(req,res)=>{
        InternExeat.findById(req.params.id).then(exeat =>{
            // Create email
            const mail = `SORRY<strong> ${exeat.fullName}</strong>,
      <br/>
      <br>
      Your Exeat Request has been rejected 
      <br/>
     <strong>YOUR ARE STRONGLY ADVISED TO NOT TO LEAVE THE HUB, ESPECIALLY ON - ${exeat.timeTo}</strong> <br/>
      <strong>Best Regards!!!</strong>
      `
    // Sending the mail
    mailer.sendEmail('nhubacademy@gmail.com', exeat.email, 'Exeat Approval', mail);

            exeat.remove().then(exeat =>{
                req.flash('success',`Request By ${exeat.fullName} Was Succesfully Deleted`)
                return res.redirect('back')
            }).catch(err =>{
                console.log(err)
                req.flash('error', 'Something Went Wrong Pleasee Try Again')
                return res.redirect('back')
            })
        })
    
    },
    // ================================================================ approve intern exeat =========================================
    approveStudentExeat: (req, res) => {
        StudentExeat.findById(req.params.id).then(exeat => {
            if (exeat.isApproved == true) {
                req.flash('error', 'This Request Has Been Approved')
                return res.redirect('back')
            }
            // Create email
            const mail = `CONGRATS!!! <strong> ${exeat.fullName}</strong>,
      <br/>
      <br>
      Your Exeat Request has been appproved!!! 
      <br/>
     <strong>YOUR ARE STRONGLY ADVISED TO RETURN AT THE STATED DATE - ${exeat.timeTo}</strong> <br/>
      <strong>Best Regards!!!</strong>
      `
            // Sending the mail
            mailer.sendEmail('nhubacademy@gmail.com', exeat.email, 'Exeat Approval', mail);

            exeat.isApproved = true;
            exeat.save().then(exeat => {
                req.flash('success', 'Approved Successfully')
                return res.redirect('back')
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something Went Wrong Pleasee Try Again')
                return res.redirect('back')
            })

        })
    },
    // ============================================ reject intern exeat ===================================
    rejectStudentExeat: (req, res) => {
        StudentExeat.findById(req.params.id).then(exeat => {
            // Create email
            const mail = `SORRY<strong> ${exeat.fullName}</strong>,
      <br/>
      <br>
      Your Exeat Request has been rejected 
      <br/>
     <strong>YOUR ARE STRONGLY ADVISED TO NOT TO LEAVE THE HUB, ESPECIALLY ON - ${exeat.timeTo}</strong> <br/>
      <strong>Best Regards!!!</strong>
      `
            // Sending the mail
            mailer.sendEmail('nhubacademy@gmail.com', exeat.email, 'Exeat Approval', mail);

            exeat.remove().then(exeat => {
                req.flash('success', `Request By ${exeat.fullName} Was Succesfully Deleted`)
                return res.redirect('back')
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something Went Wrong Pleasee Try Again')
                return res.redirect('back')
            })
        })

    },
    // ========================================================== clear intern exeats requests ========================
    deleteInternExeatRequests:(req,res)=>{
        InternExeat.remove().then(deletedExeats =>{
            req.flash('success','Successfully Cleared')
            return res.redirect('back')
        }).catch(err =>{
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ========================================================== clear studentexeats requests ========================
    deleteStudentExeatRequests: (req, res) => {
        StudentExeat.remove().then(deletedExeats => {
            req.flash('success', 'Successfully Cleared')
            return res.redirect('back')
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ========================================================= ALL INTERNS GET ================
    allInternsGet:(req,res)=>{
        Intern.find().then(interns => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                console.log('consolingfounDIN:', interns)
                let pageTitle = 'All Interns'
                res.render('admin/allInterns', { layout: 'adminLayout', interns: interns, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))
    },
    // ========================================================= ALL STUDENTS GET ================
    allStudentsGet: (req, res) => {
        Student.find().then(students => {
            Admin.findOne({ firstName: 'Bashir' }, (err, admin) => {
                const fullName = admin.firstName + ' ' + admin.lastName
                console.log('consolingfounDIN:', students)
                let pageTitle = 'All Students'
                res.render('admin/allStudents', { layout: 'adminLayout', students: students, admin: admin, fullName: fullName, pageTitle })

            })
        }).catch((e) => console.log(e))
    },
    // ===================================================================== CLEAR INTERNSHIP APPLICAIONS ========================
    deleteInternshipApplications:(req,res)=>{
        InternshipApplications.remove().then(applications =>{
            req.flash('success','All Applications Have Been Cleared')
            res.redirect('back')
        }).catch(err =>{
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ===================================================================== CLEAR INTERNS sign out ========================
    deleteInternsSignOut: (req, res) => {
        InternSignOut.remove().then(applications => {
            req.flash('success', 'Cleared')
            res.redirect('back')
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ===================================================================== CLEAR STUDENTS sign out ========================
    deleteStudentsSignOut: (req, res) => {
        StudentSignOut.remove().then(applications => {
            req.flash('success', 'Cleared')
            res.redirect('back')
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ===================================================================== CLEAR INTERNS sign in ========================
    deleteInternsSignIn: (req, res) => {
        InternSignIn.remove().then(applications => {
            req.flash('success', 'Cleared')
            res.redirect('back')
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },
    // ===================================================================== CLEAR students sign in ========================
    deleteStudentsSignIn: (req, res) => {
        StudentSignIn.remove().then(applications => {
            req.flash('success', 'Cleared')
            res.redirect('back')
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something Went Wrong Pleasee Try Again')
            return res.redirect('back')
        })
    },

    
            // =========================================================   LOG OUT ================================
    logoutGet: (req, res) => {

        req.logout();
        req.flash("success", "successfully logged out");
        res.redirect("/");
    }



}


