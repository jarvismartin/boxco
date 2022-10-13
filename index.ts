import { api, data, events, params, storage } from "@serverless/cloud";
import { nanoid } from "nanoid";
import { hash, verify } from "@node-rs/argon2";

// Utils
import {
  authenticateToken,
  generateToken,
  getUserByEmail,
  getUserById,
} from "./utils";

/*
 * Sign Up
 */
api.post("/api/v1/signup", async (req, res) => {
  // TODO - VALIDATE INPUTS
  const given_name = req.body.given_name;
  const family_name = req.body.family_name;
  const email = req.body.email;
  const pw = req.body.password;

  // Are they already registered?
  let found = await getUserByEmail(email);

  let ret;

  if (found.items.length != 0) {
    ret = { err: "User already registered" };
  } else {
    // Generate id
    const id = nanoid();

    // Hash password
    const password = await hash(pw).then((data) => {
      return data;
    });

    const email = req.body.email;

    // Handle Sellers
    const seller = req.body.seller;
    console.log("SELLER:", seller);

    // Set up basic user data
    let user = {
      id,
      email,
      email_confirmed: false,
      password,
      type: "buyer",
      status: "active",
      sellerID: null,
      storeName: null,
    };

    if (seller) {
      const seller_id = nanoid();
      const store_name = req.body.store_name;

      user.type = "seller";
      user.sellerID = seller_id;
      user.storeName = store_name;
    }

    let newUser = await data.set(`id:${id}`, user, {
      label1: email,
      label2: user.type,
      label3: "active",
    });
    console.log("NEW USER:", newUser);

    // remove the password hash
    delete newUser.password;

    ret = newUser;
  }
  // Return the results
  res.send(ret);
});

/*
 * Login
 */
api.post("/api/v1/login", async (req, res) => {
  // TODO - VALIDATE INPUTS
  const email = req.body.email.trim().toLowerCase();
  const pw = req.body.password.trim();

  // Are they already registered?
  let found = await getUserByEmail(email);

  let ret;

  if (found.items.length === 0) {
    ret = { err: "User not registered" };
  } else {
    // Verify password
    const hash = found.items[0].value.password;
    const verified = await verify(hash, pw);

    let foundUser = found.items[0].value;

    // remove the password hash
    delete foundUser.password;

    // Return JWT
    const token = generateToken(foundUser.id);

    foundUser.token = token;

    ret = foundUser;
  }

  // Return the results
  res.json(ret);
});

/*
 * Add Product
 */
api.post("/api/v1/products/add", authenticateToken, async (req, res) => {
  // TODO - VALIDATE INPUTS
  const product_name = req.body.name.trim();
  const product_price = req.body.price;
  const product_stock = req.body.stock;
  const product_sku = req.body.sku.trim();
  const seller_id = req.body.sellerID;

  // Is this product already registered?
  let found = { items: [] };

  let ret;

  if (found.items.length != 0) {
    ret = { err: "Product already registered" };
  } else {
    // Generate id
    const id = nanoid();

    // Set up basic user data
    let product = {
      id,
      name: product_name,
      price: product_price,
      stock: product_stock,
      type: "product",
      status: "active",
      sellerID: seller_id,
      sku: product_sku,
    };

    ret = await data.set(`product:${id}`, product, {
      label1: `product:${seller_id}`,
      label2: "product",
      label3: "active",
    });
  }
  // Return the results
  res.send(ret);
});

/*
 * Get Products
 */
api.get("/api/v1/products", async (req, res) => {
  /*
   * TODO - Convert to POST, to get start, limit, and/or reverse
   * Get meta info, and return paginated results
   *
   * ref: https://www.serverless.com/cloud/docs/apps/data
   */
  /*
   * start - string - A key (including namespace)
   * to start retrieving items from. Used for pagination.
   *
   * const start = req.body.hasOwnProperty("start") ? req.body.start : 0;
   */

  // Get the first 100 products
  let products = await data.get("product:*");
  console.log("PRODUCTS:", products);

  // Return the results
  res.json(products);
});

/*
 * Get Seller's Products
 */
api.post("/api/v1/seller_products", authenticateToken, async (req, res) => {
  // TODO - set up for pagination as with /products

  const sellerID = req.body.sellerID;

  let seller_products = await data.getByLabel("label1", `product:${sellerID}`);
  console.log("SELLER PRODUCTS:", seller_products);

  // Return the results
  res.json(seller_products);
});

/*
 * Update Product
 */
api.post("/api/v1/update_product", authenticateToken, async (req, res) => {
  // TODO - set up for pagination as with /products
  // TODO - Verify requestor actually owns the product?

  const id = req.body.id;
  const name = req.body.name.trim();
  const price = req.body.price;
  const sku = req.body.sku.trim();

  // Handle increment/decrement in such a way
  // that they will be eventually correct
  // Rather than overwriting product.stock,
  // add or subtract changes.
  const qty_delta = req.body.qty_delta;

  // Get the exiting product object
  const oldProduct = await data.get(`product:${id}`);
  console.log("OLD PRODUCT:", oldProduct);

  // Copy the old object
  const newProduct = {};
  Object.assign(newProduct, oldProduct);

  // Update the object
  newProduct.name = name;
  newProduct.price = price;
  newProduct.sku = sku;

  // Handle stock deltas
  newProduct.stock = parseInt(oldProduct.stock) + parseInt(qty_delta);

  console.log("UPDATED PRODUCT:", newProduct);
  // Save the object
  let set = await data.set(`product:${id}`, newProduct);
  console.log("SET:", set);

  // Return the update product
  res.json(newProduct);
});

/*
 * Update Order
 */
api.post("/api/v1/update_order", authenticateToken, async (req, res) => {
  console.log("UPDATE ORDER");

  // TODO - set up for pagination

  // let order_id = Object.hasOwn(req.body, "order_id") ? req.body.order_id : null;
  let order_id = req.body.hasOwnProperty("id") ? req.body.id : null;

  let newOrder;

  // Create new order
  if (!order_id) {
    // Create order id
    order_id = nanoid();

    const buyer_id = req.body.buyer_id;
    const product = req.body.product;
    const qty = req.body.qty;

    // Record the time and date of order
    const d = new Date();
    const ordered_on = JSON.stringify(d);

    // Create the order object
    newOrder = {
      id: order_id,
      product: product,
      buyer_id,
      qty,
      ordered_on,
      shipping: { carrier: "processing...", tracking_number: "processing..." },
      status: "received",
    };

    /*
     * UPDATE STOCK LEVEL
     */
    // Get the exiting product object
    const oldProduct = await data.get(`product:${newOrder.product.id}`);
    console.log("OLD PRODUCT:", oldProduct);

    // Update product stock amount
    const updated_stock = oldProduct.stock - newOrder.qty;
    newOrder.product.stock = updated_stock;

    // Update the product data
    let update_product = await data.set(
      `product:${newOrder.product.id}`,
      newOrder.product
    );
    console.log("UPDATED PRODUCT STOCK INFO:", update_product);
  } else {
    newOrder = req.body;
  }

  console.log("UPDATED ORDER:", newOrder);

  // SAVE THE ORDER DATA
  let set_order = await data.set(`order:${newOrder.id}`, newOrder, {
    label1: `order:${newOrder.buyer_id}`,
    label2: `order:${newOrder.product.sellerID}`,
    label3: `order:${newOrder.status}`,
  });
  console.log("SET ORDER:", set_order);

  // Return the update product
  res.json(set_order);
});

/*
 * Get Orders
 */
api.post("/api/v1/orders", authenticateToken, async (req, res) => {
  // TODO - set up for pagination as with /products

  const buyer_id = req.body.buyer_id;
  const seller_id = req.body.seller_id;

  let orders = await data.getByLabel("label1", `order:${buyer_id}`);
  console.log("ORDERS:", orders);

  // Return the results
  res.json(orders);
});

/*
 * DEFAULT
 * Redirect to home endpoint
 */
api.get("/*", (req, res) => {
  res.redirect("/");
});
