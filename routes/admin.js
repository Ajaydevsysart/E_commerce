const express = require('express');
const router = express.Router();
const producthelper=require('../helpers/product-helpers')

// get admin 

router.get('/', (req, res,next) => {
    producthelper.getAllProducts().then((products)=>{
        res.render("admin/view-products", { products, admin: true })
    })
    
})

router.post('/add-product', (req, res) => {
    console.log(req.body)
    console.log(req.files.image);

    producthelper.addProduct(req.body,(id)=>{
        let image=req.files.image
        image.mv('./public/images/product-images/'+id+'.jpg',(err,done)=>{
            if(!err){
                res.render('admin/add-product',{admin:true})
            }else{
              console.log(err)  
            }
        })
        

    })
})


//add product
router.get('/addproduct', (req, res) => {
    res.render('admin/add-product', { admin: true })

})


module.exports = router;