const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
const delet = require('mongodb').ObjectID;
const { reject } = require('bcrypt/promises');


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
            // console.log(cartItems[0].product)
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
                        resolve(true)
                    })
                }
        })
    },
    getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
            console.log(userId)
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
            console.log(total);
            resolve(total[0].total)
        })

    }
}