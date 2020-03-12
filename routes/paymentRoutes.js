const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController")
const {emailCheck} = require('../config/customFunctions')


router.route('/frontEndDevelopment')
.get(paymentController.frontEndDevelopmentGet)

router.route('/cyberSecurity')
    .get(paymentController.cyberSecurityGet)

router.route('/lampStack')
    .get(paymentController.lampStackGet)    

router.route('/meanStack')
    .get(paymentController.meanStackGet)

router.route('/mobileAppDevelopment')
    .get(paymentController.mobileAppDevelopmentGet)

router.route('/djangoFrameWork')
    .get(paymentController.djangoFrameWorkGet)

router.route('/introductionToProgramming')
    .get(paymentController.introductionToProgrammingGet)    

router.route('/nodeJsFrameWork')
    .get(paymentController.nodeJsFrameWorkGet)

router.route('/virtualReality')
    .get(paymentController.virtualRealityGet)


router.route('/paystack/pay')
.post(paymentController.paymentPayPost)
 
// -===================================================   ERROR HANDLER =============================================
router.route('/error')
.get(paymentController.payErrorGet)









module.exports = router;
