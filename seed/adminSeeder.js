const Admin = require("../models/admin")
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// Database connections
mongoose.Promise = global.Promise;
const MONGO_URL = require("../config/db").MONGOURL;

mongoose
    .connect(MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log(`Database connected at ${MONGO_URL}`))
    .catch(err => console.log(`Database Connection failed ${err.message}`));

const admin =
    new Admin({
    firstName: "Bashir",
    lastName: "Sheidu",
    email: "nhubacademy@gmail.com",
    password: "abcde12345",
    userType: "Admin",
    profilePicture:"https://res.cloudinary.com/raymondtemtsen/image/upload/v1564475712/t6ifoxxtfrq244gcyvni.jpg"
})
;
// Hash the password and seed
console.log(admin.password)
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(admin.password ,salt, (err, hash) => {
            if (err) {console.log(err);}
            admin.password = hash;
            admin.save().then((admin)=>{
                console.log(admin)
            }).catch((err)=>{
                console.log(err)
            })
        })
    })
