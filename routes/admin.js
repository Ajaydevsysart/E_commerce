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
                req.flash('success_msg', 'You are now registered and can log in');
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

//delete product

router.get('/deleteproduct/:id',(req,res)=>{
    let proId=req.params.id
    console.log(proId);
    producthelper.deleteProduct(proId).then((response)=>{
        res.redirect('/admin/')
    })

})

//edit page
router.get('/edit-product/:id',async(req,res)=>{
    let product=await producthelper.getProductDetails(req.params.id)
    console.log(product)
    res.render('admin/edit-product',{product,admin:true})
})

//edit product post catagory error
router.post('/edit-product/:id',(req,res)=>{
    let id=req.params.id
    producthelper.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin')
        if(req.files.image){
            let image=req.files.image
            image.mv('./public/images/product-images/'+id+'.jpg')

        }
    })
})


module.exports = router;