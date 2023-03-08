const express = require("express");
const { MongoClient } = require("mongodb");
const SSLCommerzPayment = require("sslcommerz");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//<------------- Database Code Here ---------->

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eb0xvvp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    //<------------ Database All Collections ------------->
    const database = client.db(`${process.env.DB_NAME}`);
    const Products = database.collection(`${process.env.PRODUCT_COLLECTION}`);
    const ProductCategory = database.collection(
      `${process.env.PRODUCT_CATEGORY_COLLECTION}`
    );
    const Orders = database.collection(`${process.env.ORDER_COLLECTION}`);
    const customers = database.collection(`${process.env.CUSTOMER_COLLECTION}`);
    const users = database.collection(`${process.env.USER_COLLECTION}`);
    const blogs = database.collection(`${process.env.BLOG_COLLECTION}`);

    //<--------------- Products Section API --------------->//

    //<------------ Get All Products ------------->

    app.get("/products", async (req, res) => {
      const FindProducts = await Products.find({}).toArray();
      res.send(FindProducts);
    });

    //<------------ Get Single Product By ID ------------->

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleProduct = await Products.findOne(query);
      res.json(singleProduct);
    });

    //<------------ Edit Single Products ------------->

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateReq = req.body;
      const result = await Products.updateOne(
        query,
        {
          $set: {
            rating: updateReq.rating,
            name: updateReq.name,
            price: updateReq.price,
            offerPrice: updateReq.offerPrice,
            category: updateReq.category,
            slug: updateReq.slug,
            SKU: updateReq.SKU,
            productImage: updateReq.productImage,
          },
        },
        { upsert: true }
      );
      res.json(result);
    });

    //<------------ Delete Single Products ------------->

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const remove = await Products.deleteOne(query);
      res.json(remove);
    });

    //<------------ Post a New Product ------------->

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await Products.insertOne(newProduct);
      res.json(result);
    });

    //<------------ Get Products Category ------------->

    app.get("/productsCategory", async (req, res) => {
      const allCategory = await ProductCategory.find({}).toArray();
      res.send(allCategory);
    });

    //<------------ Get All Products by Category ------------->

    app.get("/findProducts", async (req, res) => {
      const search = req.query.category;
      const products = await Products.find({}).toArray();
      const findProducts = products?.filter((value) =>
        value?.category?.includes(search)
      );
      res.send(findProducts);
    });

    //<--------- Get Featured Products ---------->

    app.get("/featuredProduct", async (req, res) => {
      const featuredData = req.query;
      const result = await Products.find({
        slug: featuredData.featured,
      }).toArray();
      res.send(result);
    });

    //<--------- Get Top trending Products ---------->

    app.get("/topTrending", async (req, res) => {
      const trendingData = req.query;
      const result = await Products.find({
        slug: trendingData.trending,
      }).toArray();
      res.send(result);
    });

    //<--------- Get Best Selling Products ---------->

    app.get("/bestSelling", async (req, res) => {
      const sellingData = req.query;
      const result = await Products.find({
        slug: sellingData.bestSellar,
      }).toArray();
      res.send(result);
    });

    //<--------- Get New Arrival Products ---------->

    app.get("/newArrival", async (req, res) => {
      const newArrivalData = req.query;
      const result = await Products.find({
        slug: newArrivalData.newArrival,
      }).toArray();
      res.send(result);
    });

    //<------------ Find Products Information For Cart ------------->

    app.get("/addToCart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const showOrder = await Products.findOne(query);
      res.json(showOrder);
    });

    //<--------------- Orders Section API --------------->//

    // Get All Orders

    app.get("/orders", async (req, res) => {
      const allOrders = await Orders.find({}).toArray();
      res.send(allOrders);
    });

    // Approved An Order

    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const orderStatus = req.body;
      const result = await Orders.updateOne(
        query,
        {
          $set: { status: orderStatus.status },
        },
        { upsert: true }
      );
      res.json(result);
    });

    //<------------ Post a New Product ------------->

    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await Orders.insertOne(newOrder);
      res.json(result);
    });
    //<--------------- Customers Section API --------------->//

    // Get All Customers

    app.get("/customers", async (req, res) => {
      const allCustomers = await customers.find({}).toArray();
      res.send(allCustomers);
    });

    //<------------ Get Single Customer By ID ------------->

    app.get("/customer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const singleCustomer = await customers.findOne(query);
      res.json(singleCustomer);
    });

    // Post New Customer

    app.post("/customers", async (req, res) => {
      const newCustomer = req.body;
      const result = await customers.insertOne(newCustomer);
      res.send(result);
    });

    //<------------ Delete a Customer ------------->

    app.delete("/customer/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const remove = await customers.deleteOne(query);
      res.json(remove);
    });

    //<--------------- Users Section API --------------->//

    // Signup New User

    app.post("/signup", async (req, res) => {
      try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Create a new user document
        const user = {
          name: req.body.name,
          username: req.body.username,
          email: req.body.email,
          phone: req.body.phone,
          password: hashedPassword,
        };
        const findUser = await users.findOne({ phone: req.body.phone });
        if (findUser) {
          return res.status(400).send({ message: "User already exists" });
        } else {
          // Insert the user into the database
          const result = await users.insertOne(user);
          // Send a success response
          res.status(201).send(result);
        }
      } catch (err) {
        // Send an error response
        res.status(400).send(err);
      }
    });

    // Login Existing User

    // Handle POST requests to /login
    app.post("/login", async (req, res) => {
      try {
        // Find the user by phone number
        const user = await users.findOne({ phone: req.body.phone });

        // If the user is not found, send an error response
        if (!user) {
          return res
            .status(401)
            .send({ message: "Phone number or password is incorrect" });
        }

        // Compare the password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(
          req.body.password,
          user.password
        );

        // If the password is not valid, send an error response
        if (!isPasswordValid) {
          return res
            .status(401)
            .send({ message: "Phone number or password is incorrect" });
        }

        // Generate a JWT token
        const token = jwt.sign({ phone: user.phone }, "secret");

        // Send the token in the response
        res.send({ token, phone: user.phone });
      } catch (err) {
        // Send an error response
        res.status(400).send(err);
      }
    });

    // Get All Users

    app.get("/users", async (req, res) => {
      const allUsers = await users.find({}).toArray();
      res.send(allUsers);
    });

    // Post New User

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await users.insertOne(newUser);
      res.send(result);
    });

    //<--------------- Blogs Section API --------------->//

    //<------------ Get All Blogs ------------->

    app.get("/blogs", async (req, res) => {
      const AllBlogs = await blogs.find({}).toArray();
      res.send(AllBlogs);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Health OS Server");
});

app.listen(port, () => {
  console.log("Running Server Port is", port);
});
