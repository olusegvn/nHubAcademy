require("dotenv").config("./.env");
const express = require("express");
const app = express();
const logger = require("morgan");
const path = require("path");
const expresshandlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const methodOverride = require('method-override');
const mailer = require("./misc/mailer");
const AcceptedStudent = require('./models/acceptedStudent')
const { Pay } = require('./models/pay');
const _ = require('lodash');
const request = require('request');
const bcrypt = require("bcryptjs");
const { initializePayment, verifyPayment } = require('./config/paystack')(request);
const InternshipApplications = require('./models/internshipApplication')
const randomString = require("randomstring")
const AcceptedInterns = require("./models/acceptedIntern")
const Intern = require("./models/intern")
const Student = require("./models/student")
const Admin = require('./models/admin')
const async = require("async")
var crypto = require("crypto")

const mongoStore = require("connect-mongo")(session);
// Mongodb Config
mongoose.set('useCreateIndex', true);
// Database connections
mongoose.Promise = global.Promise;
const MONGO_URL = require("./config/db").MONGOURL;

mongoose
    .connect(MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log(`Database connected at ${MONGO_URL}`))
    .catch(err => console.log(`Database Connection failed ${err.message}`));

const port = process.env.PORT || 5000;
// template engine
app.use(logger("dev"));
const hbs = expresshandlebars.create({
    defaultLayout: "default", extname: ".hbs"})
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set('views', __dirname + '/views')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "cathx",
        resave: false,
        saveUninitialized: false,
        store: new mongoStore({ mongooseConnection: mongoose.connection }),
        cookie: {
            maxAge: 180 * 60 * 1000
        }
    })
);

/* Method Override Middleware*/
app.use(methodOverride('newMethod'));
// initalize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Setup flash/ Environmental variables
app.use((req, res, next) => {
    res.locals.success_messages = req.flash("success");
    res.locals.error_messages = req.flash("error");
    res.locals.user = req.user ? true : false;
    res.locals.session = req.session;
    next();
});
app.use((req,res,next)=>{
    res.locals.login = req.isAuthenticated();
    next();
})
// ================================================ Routes =========================================
const defaultRoutes = require("./routes/defaultRoutes")
const internsRoutes = require("./routes/internsRoutes")
const paymentRoutes = require('./routes/paymentRoutes')
const studentsRoutes = require('./routes/studentsRoutes')
const adminRoutes = require('./routes/adminRoutes')
// defualt route
app.use("/",defaultRoutes);
//interns route
app.use("/interns",internsRoutes)
// student routes
app.use('/students',studentsRoutes)
// admin routes
app.use('/admin',adminRoutes)

// paymentRoutes
app.use('/payment',paymentRoutes)
//paystack route
// ==============================================================      pay stack  =============================
app.use("/users", require("./routes/payapp"));



//paystack callback
app.get('/paystack/callback', (req, res) => {
    const ref = req.query.reference;
    verifyPayment(ref, (error, body) => {
        if (error) {
            //handle errors appropriately
            console.log(error)
            return res.redirect('/payment/error');
        }
        response = JSON.parse(body);

        const data = _.at(response.data, ['reference', 'amount', 'customer.email', 'metadata.full_name']);

        [reference, amount,email, full_name] = data;

        newPay = { reference, amount, email, full_name}

        const pay = new Pay(newPay)

        pay.save().then((pay) => {
            if (!pay) {
                return res.redirect('/payment/error');
            }
            res.redirect('/receipt/' + pay._id);
        }).catch((e) => {
            res.redirect('/payment/error');
        })
    })
});

app.get('/receipt/:id', (req, res) => {
    const id = req.params.id;
    console.log(id)

    Pay.findById(id).then(async(pay) => {
        if (!pay) {
            //handle error when the donor is not found
            res.redirect('/payment/error')
        }
        console.log(pay)
        let payAmount = pay.amount / 100
        res.render('payment/success', { pay, payAmount });
        // Nhub funcitonality input
        // generate password
        var password = randomString.generate({length: 5,charset: 'numeric'});
        //generate id number
        var studentId = `NA${randomString.generate({ length: 4, charset: 'numeric' })}`


        // ====================================== send Email =====================================================
        
        // Create email
        const mail = `Hello ${pay.full_name},
      <br/>
      <br>
      Thank You enrolling for *A* course at ${req.headers.host}.
      <br/>
        You can now login in our website, Here are your Credentials:
        <br/><br/>
        <strong>STUDENT ID: </strong>  <strong>${studentId}</strong> <br/>
        <strong>EMAIL: </strong>  <strong>${pay.email}</strong> <br/>
        <strong>PASSWORD: </strong>  <strong>${password}</strong>
      <br><br>
      <a href="http://${req.headers.host}">CLICK HERE</a> To Visit Our Site
      <br><br>
      <strong>WELCOME TO THE HUB!!!</strong>
      <strong>Thank You!</strong>
      `

        // Sending the mail
        await mailer.sendEmail('nhubacademy@gmail.com', pay.email, 'Enrollment Confirmation', mail);
        console.log('ENROLLEMENT MAIL SENT, HASHING AND CREATING NEW STUDENT IS ABOUT TO BEGIN..')
     await   bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) { console.log(err); }
                password = hash;
                let newStudent = new Student({
                    fullName: pay.full_name,
                    email: pay.email,
                    studentId: studentId,
                    password: hash,
                    userType: 'Student',
                })
                newStudent.save().then((newstudent) => {
                    console.log('consoling New Student', newstudent)
                }).catch((err) => { console.log(err) })
            })
        })
        let newAcceptedStudent = new AcceptedStudent({
            email: pay.email, studentId: studentId
        })
        newAcceptedStudent.save().then(student => {
            console.log(student)
        }).catch((err)=>{console.log(err)})
        
        // =====================================  end send email =================================================
    }).catch((e) => {
        console.log(e)
        res.redirect('/payment/error')
    })
})



// Error Handler
app.use((req, res, next) => res.render("default/error404",{layout: 'error404Layout'}));
// listen...
app.listen(port, (req, res) => {
    console.log("Server is currently listening at at port:", port);
});
