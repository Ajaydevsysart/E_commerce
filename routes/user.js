const { response } = require('express');
const express = require('express');
const { CART_COLLECTION } = require('../config/collections');
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
router.get('/', async(req, res) => {
    let user=req.session.user
    let cartCount=null
    if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
    }
    producthelper.getAllProducts().then((products) => {
        res.render("user/view-products", {products,cartCount,user,admin: false })
        
    })
});

//login get===================================

router.get('/login',(req,res)=>{
    let user=req.session.user
    let cartCount=null
    if(req.session.loggedIn){
        res.redirect('/')
    }else
        res.render('user/login',{"loginErr":req.session.loginErr,cartCount,user,admin:false})
        req.session.loginErr=false

})

//signup get===================================

router.get('/signup',(req,res)=>{
    let cartCount=null
    let user=req.session.user
    res.render('user/signup',{cartCount,user,admin:false})

})

//signup post==================================

router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
        let user=req.session.user
        let cartCount=null
        console.log(response)
        req.session.loggedIn=true
        req.session.user=response
        res.render('user/login',{cartCount,"loginErr":req.session.loginErr,user,admin:false})
    })

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

router.get('/cart',verifyLogin,async(req,res)=>{
    let user=req.session.user
    let cartCount=null
    let products=await userHelpers.getCartProducts(req.session.user._id)
    if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
    }
    console.log(products)
    res.render("user/cart",{cartCount,products,user,admin:false})
})


//ADD TO CART=================================
router.get('/add-to-cart/:id',(req,res)=>{
    console.log("api call");
    userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
      res.json({status:true})
    })
})

//change product quantity
router.post('/change-product-quantity',(req,res,next)=>{
    userHelpers.changeProductQuantity(req.body).then((response)=>{
        res.json(response)

    })
})

//place order route
router.get('/place-order',verifyLogin,async(req,res)=>{
    let total=await userHelpers.getTotalAmount(req.session.user._id)
    let user=req.session.user
    let cartCount=null
    if(req.session.user){
        cartCount=await userHelpers.getCartCount(req.session.user._id)
    }
    res.render('user/place-order',{total,user,cartCount,admin:false})
})


module.exports = router;