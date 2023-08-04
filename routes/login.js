const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const Joi = require("joi");
const express = require("express");
const generateAuthToken = require("../utils/generateAuthToken");
const router = express.Router();

router.post("/", async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().min(3).max(200).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });
  const { error } = schema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  console.log("user", user)
  if (!user) return res.status(400).send("Invalid email or password...");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Invalid email or password...");

  const token = generateAuthToken(user);
    console.log("user", user)
  res.status(200).send({
      token,
      user
  });
});

router.post("/password", async(req,res)=>{
    const user = await User.findOne({email : req.body.email})
    if(!user){
      return res.status(500).send("Invalid Email")
    }
    const validPassword = await bcrypt.compare(req.body.password, user.password)

    if(!validPassword){
      return res.status(500).send("Invalid Password")
    }

    res.status(200).send(validPassword)
})


module.exports = router;
