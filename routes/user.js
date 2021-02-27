const express = require('express');
const router = express.Router();
const producthelper = require('../helpers/product-helpers')


router.get('/', (req, res) => {

    producthelper.getAllProducts().then((products) => {
        res.render("user/view-products", { products, admin: false })
    })
});

router.get('/login',(req,res)=>{
    res.render('user/login',{admin:false})

})
router.get('/signup',(req,res)=>{
    res.render('user/signup',{admin:false})

})


module.exports = router;