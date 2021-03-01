const { response } = require('express');
const express = require('express');
const router = express.Router();
const producthelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

//middle ware foe session to verify login
const verifyLogin=(req,res,next)=>{
    if(req.session.loggedIn){
        next()

    }else{
        res.redirect('/login')
    }
}

//home route=================================
router.get('/', (req, res) => {
    let user=req.session.user
    console.log(user)
    producthelper.getAllProducts().then((products) => {
        res.render("user/view-products", {products,user,admin: false })
        
    })
});

//login get===================================

router.get('/login',(req,res)=>{
    let user=req.session.user
    if(req.session.loggedIn){
        res.redirect('/')
    }else
        res.render('user/login',{"loginErr":req.session.loginErr,user,admin:false})
        req.session.loginErr=false

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
res.render('user/login',{admin:false})
})

//login post test============================

router.post('/login',(req,res)=>{
    userHelpers.doLogin(req.body).then((response)=>{
        if(response.status){
            req.session.loggedIn=true
            req.session.user=response.user
            res.redirect('/')
        }else{
            req.session.loginErr="invalid username or password"
            res.redirect('/login')
        }
    })

})

//logout ====================================

router.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

//cart =======================================

router.get('/cart',verifyLogin,(req,rest)=>{
    let user=req.session.user
    res.render("user/cart",{user,admin:false})
})






module.exports = router;