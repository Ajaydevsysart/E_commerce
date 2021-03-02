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
        return new Promise(async (resolve, reject) => {
            console.log('user Id ', userId)
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: delet(userId) })

            if (userCart) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({ user: delet(userId) }, {

                    $push: { products: delet(proId) }

                }).then((response) => {
                    resolve()
                })
            } else {
                let cartObj = {
                    user: delet(userId),
                    products: [delet(proId)]
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
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { proList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', '$$proList']
                                    }
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    }
}