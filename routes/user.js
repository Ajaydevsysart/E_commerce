const express = require('express');
const router = express.Router();
const producthelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

router.get('/', (req, res) => {

    producthelper.getAllProducts().then((products) => {
        res.render("user/view-products", { products, admin: false })
    })
});

//login get===================================

router.get('/login',(req,res)=>{
    res.render('user/login',{admin:false})

})

//signup get===================================
router.get('/signup',(req,res)=>{
    res.render('user/signup',{admin:false})

})
//signup post==================================

router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
        console.log(response)
    })

})

module.exports = router;