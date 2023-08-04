const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    desc: { type: String, required: true,},
    model: { type: String, required: true,},
    color: { type: String, required: true,},
    storage: { type: String, required: true,},
    location: { type: String, required: true,},
    price: { type: Number, required: true,},
    image: { type: Object, required: true },
    cartQuantity : 0,
    isLike : [],
    location: { type: String, required: true,},
    type :{ type: String, required: true,},
    },
    { timestamps : true }
)

const Product = mongoose.model("Product", productSchema)

exports.Product = Product