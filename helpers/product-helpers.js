const db=require('../config/connection')
const collection=require('../config/collections');
const { reject, promise } = require('bcrypt/promises');
const delet=require('mongodb').ObjectID;
const { response } = require('express');
module.exports={

    addProduct:(product,callback)=>{
        console.log(product);
        db.get().collection('product').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
            console.log(data.ops[0]._id)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:delet(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:delet(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
      return new Promise((resolve,reject)=>{
         db.get().collection(collection.PRODUCT_COLLECTION)
         .updateOne({_id:delet(proId)},{
             $set:{
                 Name:proDetails.Name,
                 description:proDetails.description,
                 catagory:proDetails.category,
                 price:proDetails.price,
                 
             }
         }).then((response)=>{
             resolve()
         })
      })  
    }
}