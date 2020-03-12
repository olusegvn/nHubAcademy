const express = require("express");
const router = express.Router();
const request = require('request');
const bodyParser = require('body-parser');
const _ = require('lodash');
const path = require('path');
const Intern = require("../models/intern")
const Student = require("../models/student")


const { Pay } = require('../models/pay')
const { initializePayment, verifyPayment } = require('../config/paystack')(request);


module.exports = {
        frontEndDevelopmentGet:(req,res)=>{
                res.render('payment/frontEndDevelopment')
        },
        cyberSecurityGet:(req,res)=>{
            res.render('payment/cyberSecurity')
        },
        lampStackGet:(req,res)=>{
            res.render('payment/lampStack')
        },
         meanStackGet: (req, res) => {
            res.render('payment/meanStack')
         },
        mobileAppDevelopmentGet: (req, res) => {
            res.render('payment/mobileAppDevelopment')
        },
        nodeJsFrameWorkGet: (req, res) => {
            res.render('payment/nodeJsFrameWork')
        },
        introductionToProgrammingGet: (req, res) => {
            res.render('payment/introductionToProgramming')
        },
        djangoFrameWorkGet: (req, res) => {
            res.render('payment/djangoFrameWork')
        },
        virtualRealityGet: (req, res) => {
            res.render('payment/virtualReality')
        },
        // =================================================== ERROR ==================================================
        payErrorGet:(req,res)=>{
            res.render('payment/payError',{layout: 'error404Layout'})
        },
        // ===============================================     major payment section =================================
        paymentPayPost:(req,res)=>{
            // Intern.findOne({ 'email': req.body.email }, (err, intern) => {
            //     if (intern) {
            //         req.flash('error', 'Email Exits In Our Database, Please Try Again With A Different Email')
            //         res.redirect('back')
            //         return

            //     }
            // })
            // Student.findOne({ 'email': req.body.email }, (err, student) => {
            //     if (student) {
            //         req.flash('error', 'Email Exits In Our Database, Please Try Again With A Different Email')
            //         res.redirect('back')
            //         return
            //     }
            // })
            const form = _.pick(req.body, ['amount', 'email', 'full_name']);
            form.metadata = {
                full_name: form.full_name
            }
            form.amount *= 100;


            initializePayment(form, (error, body) => {
                if (error) {
                    //handle errors
                    console.log(error);
                    return res.redirect('/payment/error')
                    return;
                }
                response = JSON.parse(body);
                res.redirect(response.data.authorization_url)
                console.log(response);
            });
        },

}