const express = require("express");
const router = express.Router();
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const Joi = require("@hapi/joi");
const mailer = require("../misc/mailer");
const Subscription = require("../models/subscription");
const mailChimp = require('../config/customFunctions');
const Admin = require("../models/admin")
const Intern = require("../models/intern")
const Student = require("../models/student")
const async = require("async")
var crypto = require("crypto")

// ==========================================  email subscription schema validation   ==========================
const subscriptionSchema = Joi.object().keys({
    email: Joi.string()
        .trim()
        .email()
        .required()
});
// ======================= setting default layout for routes in this file     =============================================================
// router.all('/*', (req, res, next) => {

//     req.app.locals.layout = 'default';

//     next();
// });
//======================================================= controller properties ==================================
module.exports = {

    index:(req,res)=>{
        // req.flash('success','welcome to the home page')
        res.render('default/index')
    },
   
    // ==================================================  internship Application  GET =================
    internshipApplicationGet:(req,res)=>{
        res.render('default/internshipApplication')
    },
// ========================================================= COURSES Routes ==================================
    frontEndDevelopmentGet:(req,res)=>{
        res.render('default/frontEndDevelopment')
    },
    lampStackGet: (req, res) => {
        res.render('default/lampStack')
    },
    introductionToProgrammingGet: (req, res) => {
        res.render('default/introductionToProgramming')
    },
    nodeJsFrameWorkGet: (req, res) => {
        res.render('default/nodeJsFrameWork')
    },
    meanStackGet: (req, res) => {
        res.render('default/meanStack')
    },
    cyberSecurityGet: (req, res) => {
        res.render('default/cyberSecurity')
    },
    mobileAppDevelopmentGet: (req, res) => {
        res.render('default/mobileAppDevelopment')
    },
    virtualRealityGet: (req, res) => {
        res.render('default/virtualReality')
    },

    djangoFrameWorkGet: (req, res) => {
        res.render('default/djangoFrameWork')
    },
    aboutGet:(req,res)=>{
        res.render('default/about')
    },
    faqGet: (req, res) => {
        res.render('default/faq')
    },
    allCoursesGet:(req,res)=>{
        res.render('default/allCourses')
    },

    
    // ========================================================   news letter subscription  =============================
    subscribePost: async(req,res,next)=>{
        try {
            const result = Joi.validate(req.body, subscriptionSchema);
            console.log(result);

            // Checking the database if email is taken
            const email = await Subscription.findOne({ email: result.value.email });

            // If email is taken
            if (email) {
                req.flash("error", "Email is already used.");
                res.redirect("back");
                return;
            } else {
                        //send mail to mail chimp
                addEmailToMailchimp(req.body.email);

                // Saving email to database
                const newEmail = await new Subscription(result.value);
                await newEmail.save();

                // Create email
                const letter = `Hello,
      <br/>
      <br>
       You are receiving this email because you (or someone else) have subscribed to our news Letter at ${req.headers.host}
      <br/>
      You will be getting updates on our Achievments and news from our platform at this email
      <br/>
      <br/>
      If you didn't request for this, kindly <a href="http://${req.headers.host}/unsubscribe/${result.value.email}"> CLICK HERE</a>to unsubscribe
      
      <br><br>
      <strong>All the best!!!</strong>
      `

                // Sending the mail
                await mailer.sendEmail('nhubacademy@gmail.com', result.value.email, 'Subscription Confirmation', letter);
                req.flash("success", "Thank You For Subscribing To Our News Letter");
                res.redirect('back')
         
                
            }

        } catch (error) {
            next(error);
        }

    },
    // ==================================================================    UNSUBSCRIBE GET ===============================
    unsubscribeGet:(req,res)=>{
        Subscription.findOne({ email: req.params.email }, (err, email) => {
            if (!email) {
                req.flash('error', 'No Such Email!');
                return res.redirect('back');

            }
            email.delete();
            req.flash('success', 'successfully Unsubscribed')
            res.redirect('back')
            if(err){console.log(err)}
        })
    },
    // =====================================================  dashboardGet (myaccount)  ===============================
    myAccountGet:(req,res)=>{
        console.log('consoling the user trying to access dashboard:', req.user.userType)
        if (req.user.userType === 'Intern') {

                 return res.redirect('/interns/profile')

            // Intern.findById(req.user._id).then(intern => {
                // console.log(intern)
                // let pageTitle = "Intern";
                // res.render("interns/profile", { layout: 'internsLayout',pageTitle, intern });
            // })

        } else if (req.user.userType === 'Student'){

            Student.findById(req.user._id).then(student => {
                return res.redirect('/students/profile')

                // console.log(student)
                // let pageTitle = "Student";
                // res.render("students/profile", { layout: 'studentsLayout',pageTitle, student });
            })
        } 
        else if(req.user.userType === 'Admin'){
            Admin.findById(req.user._id).then(admin => {
                console.log(admin)
                let pageTitle = "Admin";
                res.render("admin/dashboard", { layout:'adminLayout', pageTitle, admin});
        })
    }else {
        req.flash('error','None User ************************')
        res.redirect('back')
    }
    },
    // ================================================= home logout ===============================
    logoutGet:(req,res)=>{
        req.logout();
        req.flash("success", "successfully logged out");
        res.redirect("/");
    },

    // =========================================  login post console ==============================
    loginPost:(req,res)=>{
        console.log(req.body)
    },
    // ======================================================== FORGOT PASSWORD GET ===============================
    forgotPasswordGet: (req, res) => {
        res.render('default/forgotPassword')
    },
    // ================================================================== usertype check post ==========================
    userTypeCheckPost:(req,res)=>{
        console.log(req.body)
        const userType = req.body.userType;
        if(userType === 'STUDENT'){
            return res.redirect('/students/forgotPassword')
        }
        else if(userType === 'INTERN'){
            return res.redirect('/interns/forgotPassword')

        }
        else if(userType ==='ADMIN'){
            return res.redirect('/admin/forgotPassword')
        }
        else{
            req.flash('error', 'No Such User Type')
            return res.redirect('back')
        }
    },

   
}

// ================================================ mailchimp =========================================

function addEmailToMailchimp(email) {
    var request = require("request");

    var options = {
        method: 'POST',
        url: 'https://us3.api.mailchimp.com/3.0/lists/b4f43eda09/members',
        headers:
        {
            'Postman-Token': 'b9ae6e09-0833-4755-9fd9-6429d3cbdffb',
            'cache-control': 'no-cache',
            Authorization: 'Basic YW55c3RyaW5nOmMzZmZjNWI5ZDQ5YjI2ZTFhZjk1OWM3YjEzZTVmMWY4LXVzMw=='
        },
        body: {
            email_address: email,
            status: "subscribed"
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });

}

