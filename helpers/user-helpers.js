const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response, request } = require('express')
const delet = require('mongodb').ObjectID;
const { reject } = require('bcrypt/promises');
const Razorpay=require('razorpay')
var instance=new Razorpay({
    key_id: 'rzp_test_IvvKkdEC6LDCiP',
    key_secret:'2Hw3faUWQHGBSJroXvqysTll',
});


module.exports = {
    doSignup: (userData) => {
        console.log("test")
        return new Promise(async (resolve, reject) => {
            console.log(userData.Password)
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then(response => {
                resolve(response.ops[0])
                // var a = document.getElementById('pass')
                // console.log(a)
            })

        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log('login failed')
                        resolve({ status: false })
                    }
                })

            } else {
                console.log("failed")
                resolve({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: delet(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:delet(userId)})
            console.log(proObj)

            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item==proId)
                console.log(proExist, "+++");
                if (proExist!=-1) {
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:delet(userId),'products.item': delet(proId)},
                    {
                        $inc: { 'products.$.quantity': 1 }
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{ 
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:delet(userId)},
                    {

                        $push: { products: proObj }


                    }
                ).then((response)=>{
                    resolve()
                })
            }              
            } else {
                let cartObj = {
                    user: delet(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: delet(userId) }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },{
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    },
                    
                },
                {
                   $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                   } 
                }
            ]).toArray()
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: delet(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:delet(details.cart)},
                    {
                        $pull: {products:{item:delet(details.product)}}
                    }
                    ).then((response)=>{
                       
                        resolve({removeProduct:true})
                    })
                }else{
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({_id:delet(details.cart),'products.item':delet(details.product)},
                    {
                        $inc: { 'products.$.quantity':details.count}
                    }
                    ).then((response)=>{
                        resolve({status:true})
                    })
                }
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: delet(userId) }
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },{
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    },
                  
                },
                {
                   $project:{
                       item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                   } 
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:["$quantity","$product.price"]}}
                    }
                }
            ]).toArray()
            console.log(total[0].total,'total')
            resolve(total[0].total)
        })

    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode,
                    landmark:order.landmark
                },
                userId:delet(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).removeOne({user:delet(order.userId)})
                resolve(response.ops[0]._id)
            })
        })

    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:delet(userId)})
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId);
            let orders=await db.get().collection(collection.ORDER_COLLECTION)
                .find({userId:delet(userId)}).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:delet(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            console.log(orderItems)
            resolve(orderItems)
        })
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount:total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err);
                }else{
                    console.log(order,"new order");
                    resolve(order)
                }
                
              });

        })
    }
}