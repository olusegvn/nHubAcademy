const Intern = require("../models/intern")
const Student = require("../models/student")
module.exports = {

    isUserAuthenticated: (req, res, next) => {
         if (req.isAuthenticated()) {
             next();
         }
         else {
             req.flash('error','You Have To Login First')
             res.redirect('back');
         }
    },
    emailCheck:(req,res,next)=>{
        Intern.findOne({ 'email': req.body.email }, (err, intern) => {
            if (intern) {
                req.flash('error', 'Email Exits In Our Database, Please Try Again With A Different Email')
                res.redirect('back')
                return

            }
        })
        Student.findOne({ 'email': req.body.email }, (err, student) => {
            if (student) {
                req.flash('error', 'Email Exits In Our Database, Please Try Again With A Different Email')
                res.redirect('back')
                return
            }
        })
    }



};
