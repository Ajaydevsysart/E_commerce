const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
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

    }
}