 const moment = require("moment")
 const bcrypt  = require("bcrypt")
 const mongoose = require("mongoose")
 const { User } = require("../models/user")
 const { Product } = require("../models/product")
 const { auth, isUser, isAdmin } = require("../middleware/auth")

 const router = require("express").Router()

 // Add cart User and id-add Product
 router.put("/product-id/:id", async(req, res)=>{
     try{
         let userFound = await User.findById(req.params.id)
         const product = await Product.findById(req.body.productId)

         if(userFound){
            let filterData =  product.isLike.filter((id)=>{
                return  id === req.params.id
             })
             if (filterData.length === 0){
                 userFound.products.push(product)
                 product.isLike.push(req.params.id)

                 let userUpdate = await User.findByIdAndUpdate( req.params.id,
                     {products : userFound.products},
                     {new : true}
                 )
                 let productUpdate = await Product.findByIdAndUpdate( req.body.productId,
                     {isLike : product.isLike},
                     {new : true}
                 )
             } else {
                  let productUpdate = []
             }
         }
         res.status(200).send(productUpdate)
     }catch (err){
         res.status(500).send(err)
     }
 })

 // Delete cart from user and id from Product
 router.put("/product-delete/:id", async(req, res)=>{
     try{
         const userFound = await User.findById(req.params.id)
         const productFound = await Product.findById(req.body.productId)

            let userProducts = userFound.products.filter( product => product._id !== req.body.productId )

            let productLikes = productFound.isLike.filter(like => like !== req.params.id)

         const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
         {products : userProducts },
                {new : true}
         )
         const updatedProduct = await Product.findByIdAndUpdate(
                req.body.productId,
         { isLike : productLikes},
         {new : true}
         )

         res.status(200).send("Product deleted from  user and product")
     }catch(err){
         console.log("error")
         res.status(500).send(err)
     }
 })

 // Update  User  +  -  remove  clearAll
 router.put("/product/:id", async(req, res)=>{
     try{
         const foundUser = await User.findById(req.params.id)
         const foundProduct = await Product.findById(req.body.productId)

         if( req.body.type == "plus"){
          foundUser.products.forEach((product )=> product._id == req.body.productId ? product.cartQuantity +=1 : product)
         }
         if(req.body.type == "minus") {
                let index = foundUser.products.findIndex( (product) => product._id == req.body.productId)
                if(foundUser.products[index].cartQuantity > 1){
                    foundUser.products[index].cartQuantity -= 1
                }else{
                    foundUser.products.splice(index, 1)
                    const productLikes = foundProduct.isLike.filter( like => like != req.params.id)
                    const updatedProduct = await Product.findByIdAndUpdate( req.body.productId, {
                        isLike : productLikes
                    }, {new : true})
                }
         }
         if(req.body.type == "remove"){
             const  filterProducts = foundUser.products.filter( product => product._id != req.body.productId )
             foundUser.products = filterProducts
             const productLikes = foundProduct.isLike.filter( like => like != req.params.id)
             const updatedProduct = await Product.findByIdAndUpdate( req.body.productId, {
                 isLike : productLikes
             }, {new : true})
         }

         const updateUserProducts = await User.findByIdAndUpdate(
                    req.params.id,
             { products : foundUser.products },
             {new : true}
                )

            res.status(200).send("Updated")
     }catch(err){
         res.status(500).send(err)
     }
 })

 // GET all  carts
 router.get("/found/:id",  async(req, res)=>{
     try{
         const user = await User.findById(req.params.id)

         res.status(200).send({
             products : user.products
         });
     }catch(err){
         res.status(500).send(err)
     }
 })

 // GET ALL USERS
 router.get("/", isAdmin, async(req, res)=>{
  try{
      const users = await User.find().sort({_id : -1});
      res.status(200).send(users)
  }catch(err){
     res.status(500).send(err)
  }
 })

 // DElETE
 router.delete("/:id", isAdmin, async(req, res)=>{
  try{
     const deletedUser = await User.findByIdAndDelete(req.params.id)

     res.status(200).send(deletedUser)
  }catch(err){
    res.status(500).send(err)
  }
 })

 // GET USER
 router.get("/find/:id",  async(req, res)=>{
  try{
    const user = await User.findById(req.params.id)

    res.status(200).send({
     _id : user._id,
     name : user.name,
     email: user.email,
     isAdmin : user.isAdmin,
     createdAt : user.createdAt,
     products : user.products,
     createdAt : user.createdAt
   });

  }catch(err){
    res.status(500).send(err)
  }
 })

 // UPDATE USER
 router.put("/:id",  async(req, res)=>{
  try{
   const user = await User.findById(req.params.id)

   if(!(user.email === req.body.email) ){
    const emailInUse = await User.findOne({ email : req.body.email });
    if(emailInUse)
      return res.status(400).send("That email is already taken...")
   }
   if( req.body.password && user ){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    user.password = hashedPassword;
   }

   const updatedUser = await User.findByIdAndUpdate(
       req.params.id,
       {
        name : req.body.name,
        email : req.body.email,
        isAdmin : req.body.isAdmin,
        password : user.password
       },
       {new : true}
   );

   res.status(200).send({
    _id : updatedUser._id,
    name : updatedUser.name,
    email : updatedUser.email,
    isAdmin : updatedUser.isAdmin,
   })
  }catch(err){
   res.status(500).send(err)
  }
 })

 // GET USER STATS
  router.get("/stats",  isAdmin, async(req, res)=>{
  const previousMonth = moment()
      .month(moment().month() - 1)
      .set("date", 1)
      .format("YYYY-MM-DD  HH:mm:ss")

  try{
     const users = await User.aggregate([
      {
       $match : { createdAt : { $gte : new Date(previousMonth)} }
      },
      {
       $project : { month : { $month : "$createdAt"}}
      },
      {
       $group : { _id : "$month", total : { $sum : 1 } }
      }
     ])
   res.status(200).send(users)
  }catch (err){
   res.status(500).send(err)
  }
 })

 module.exports = router;