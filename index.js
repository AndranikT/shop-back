const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const products = require("./productt");
const register = require("./routes/register");
const login = require("./routes/login");
const stripe = require("./routes/stripe");
const product = require("./routes/product");
const users = require("./routes/users")
const orders = require("./routes/orders")

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

app.use("/api/register", register);
app.use("/api/login",    login);
app.use("/api/orders",   orders);
app.use("/api/stripe",   stripe);
app.use("/api/products", product);
app.use("/api/users",    users)
app.use("/api/orders",   orders)

app.get("/", (req, res) => {
  res.send("Welcome our to online shop API...");
});

app.get("/products", (req, res) => {
  res.send(products);
});

const uri = process.env.DB_URI;
const port = process.env.PORT || 5000;

app.listen( port, () => {
  console.log(`Server running on port: ${port}...`);
});

mongoose
  .connect( 'mongodb+srv://andraniktoplaxacyan:2180480Ba@cluster0.8prjqhl.mongodb.net/o-online?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connection established..."))
  .catch((error) => console.error("MongoDB connection failed:", error.message));
