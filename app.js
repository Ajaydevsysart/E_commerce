const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const upload=require('express-fileupload')
csvtojson = require("csvtojson");
const db=require('./config/connection')
const session=require('express-session')



db.connect((err)=>{
    if(err) console.log("connection error"+err)
    else  console.log("db connected to port 27017");
})

app.use(express.urlencoded({extended: true})); 
app.use(express.json()); 


// Access public folder from root
app.use("/public", express.static("public"));
app.get("/layouts/", function(req, res) {
  res.render("view");
});

//session handle

app.use(session({secret:"Key",cookie:{maxAge:600000}}))



//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// app.set('layout', 'views/layout/layout');  
//object for file upload
let csvData = "test";
app.use(upload());

//Routes
app.use('/', require('./routes/user'));
app.use('/admin', require('./routes/admin'));


app.listen(3000, () => {
console.log('App is running on http://localhost:3000');
});