const { Product } = require("../models/product")
const {User} = require("../models/user")
const cloudinary = require("../utils/cloudinary")
const express = require("express")
const moment = require("moment")
const bcrypt  = require("bcrypt")

const router = require("express").Router();
const { auth, isUser, isAdmin } = require("../middleware/auth");

// GET products type
router.put("/type", async(req, res)=>{
    try{
        const products = await Product.find({
            type: req.body.typeOfProduct
        })
        res.status(200).send(products);
    }catch (err){
        console.log(err)
    }
})


router.post("/",  isAdmin, async (req, res) => {
    const { name, brand, desc, price, image , color, model, storage ,type, location} = req.body;
    try {
        if (image) {
                const uploadedResponse = await cloudinary.uploader.upload(image, {
                upload_preset: "online-shop",
            });
            if (uploadedResponse) {
                const product = new Product({
                    name,
                    model,
                    color,
                    storage,
                    brand,
                    desc,
                    price,
                    location,
                    type,
                    image: uploadedResponse,
                });

                const savedProduct = await product.save();
                res.status(200).send(savedProduct);
            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    const qbrand = req.query.brand;
    try {
        let products;

        if (qbrand) {
            products = await Product.find({
                brand: qbrand,
            });
        } else {
            products = await Product.find();
        }
        res.status(200).send(products);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Edit PRODUCT
router.put("/:id", isAdmin, async (req, res)=> {
    if(req.body.productImg) {
        try{
            const destroyResponse = await cloudinary.uploader.destroy(
                req.body.import.public_id
            )
            if (destroyResponse) {
                const uploadedResponse = await cloudinary.uploader.upload(
                    req.body.productImg,
                    {
                        upload_preset: "online-shop"
                    }
                )
                if (uploadedResponse) {
                    const updateProduct = await Product.findByIdAndUpdate(
                        req.params.id,
                        {
                            $set: {
                                ...req.body.product,
                                image: uploadedResponse,
                            },
                        },
                        {new: true}
                    )
                    res.status(200).send(updateProduct)
                }
            }
        }catch (err){
            res.status(500).send(err)
        }
    }else{
        try{
            const updatedProduct = await  Product.findByIdAndUpdate(
                req.params.id,
            {
                    $set : req.body.product,
                    },
            {
                        new : true
                    }
            );
                res.status(200).send(updatedProduct)
            }catch (err){
                res.status(500).send(err)
            }
        }
})

// GET Product
router.get("/find/:id", async (req, res)=>{
    try{
    const product  = await Product.findById(req.params.id)
    res.status(200).send(product)
    }catch(err){
        res.status(500).send(err)
    }
})

// Delete
router.delete("/:id", isAdmin, async (req, res) => {
    try {
        const product  = await Product.findById(req.params.id);

        if(!product) return res.status(500).send("Product not found")

        if( product.image.public_id ) {
            const destroyResponse = await cloudinary.uploader.destroy(
                product.image.public_id
            )
            if(destroyResponse){
                const deletedProduct = await Product.findByIdAndDelete(req.params.id)
                res.status(200).send(deletedProduct);
            }
        }else{
            console.log("Failed to deleted product image")
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;


