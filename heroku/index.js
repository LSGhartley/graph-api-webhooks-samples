/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
require("dotenv").config();

var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var xhub = require("express-x-hub");
const axios = require("axios");
const { default: mongoose } = require("mongoose");

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"));

//Connect MongoDB
const mongoURI = process.env.DATABASE_URL;
console.log("connecting with: ", mongoURI);
mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", () => {
  console.log("connected to MongoDB");
});

//Define a schema/
const notificationSchema = new mongoose.Schema({
  object: { type: String },
  entry: [
    {
      id: { type: String },
      changes: [
        {
          value: {
            messaging_product: { type: String },
            metadata: {
              display_phone_number: { type: String },
              phone_number_id: { type: String },
            },
            contacts: [
              {
                wa_id: { type: String, default: null },
                user_id: { type: String, default: null },
                profile: { name: { type: String, default: null } },
              },
            ],
            errors: [
              {
                code: { type: Number, default: null },
                title: { type: String, default: null },
                message: { type: String, default: null },
                error_data: { details: { type: String, default: null } },
              },
            ],
            statuses: [
              {
                biz_opaque_callback_data: { type: String, default: null },
                conversation: {
                  id: { type: String, default: null },
                  expiration_timestamp: { type: String, default: null },
                  origin: {
                    type: { type: String },
                  },
                },
                id: { type: String, default: null },
                pricing: {
                  billable: { type: Boolean, default: null },
                  category: { type: String, default: null },
                  pricing_model: { type: String, default: null },
                },
                recipient_id: { type: String, default: null },
                status: { type: String, default: null },
                timestamp: { type: String, default: null },
                errors: [
                  {
                    code: { type: Number, default: null },
                    title: { type: String, default: null },
                    message: { type: String, default: null },
                    error_data: { details: { type: String, default: null } },
                  },
                ],
              },
            ],
            messages: [
              {
                from: { type: String, default: null },
                id: { type: String, default: null },
                timestamp: { type: String, default: null },
                type: { type: String, default: null },
                text: {
                  body: { type: String, default: null },
                },
                errors: [
                  {
                    code: { type: Number, default: null },
                    title: { type: String, default: null },
                    message: { type: String, default: null },
                    error_data: { details: { type: String, default: null } },
                  },
                ],
                system: {
                  body: { type: String, default: null },
                  identity: { type: String, default: null },
                  new_wa_id: { type: String, default: null },
                  wa_id: { type: String, default: null },
                  type: { type: String, default: null },
                  customer: { type: String, default: null },
                },
                video: {
                  caption: { type: String, default: null },
                  filename: { type: String, default: null },
                  sha256: { type: String, default: null },
                  id: { type: String, default: null },
                  mime_type: { type: String, default: null },
                },
                sticker: {
                  mime_type: { type: String, default: null },
                  sha256: { type: String, default: null },
                  id: { type: String, default: null },
                  animated: { type: Boolean, default: null },
                },
                referral: {
                  source_url: { type: String, default: null },
                  source_type: { type: String, default: null },
                  source_id: { type: String, default: null },
                  headline: { type: String, default: null },
                  body: { type: String, default: null },
                  media_type: { type: String, default: null },
                  image_url: { type: String, default: null },
                  video_url: { type: String, default: null },
                  thumbnail_url: { type: String, default: null },
                  ctwa_clid: { type: String, default: null },
                },
                order: {
                  catalog_id: { type: String, default: null },
                  text: { type: String, default: null },
                  product_items: [
                    {
                      product_retailer_id: { type: String, default: null },
                      quantity: { type: String, default: null },
                      item_price: { type: String, default: null },
                      currency: { type: String, default: null },
                    },
                  ],
                },
                interactive: {
                  type: {
                    button_reply: {
                      id: { type: String, default: null },
                      title: { type: String, default: null },
                    },
                    list_reply: {
                      id: { type: String, default: null },
                      title: { type: String, default: null },
                      description: { type: String, default: null },
                    },
                  },
                },
                image: {
                  caption: { type: String, default: null },
                  sha256: { type: String, default: null },
                  id: { type: String, default: null },
                  mime_type: { type: String, default: null },
                },
                identity: {
                  acknowledged: { type: Boolean, default: null },
                  created_timestamp: { type: String, default: null },
                  hash: { type: String, default: null },
                },
                document: {
                  caption: { type: String, default: null },
                  filename: { type: String, default: null },
                  sha256: { type: String, default: null },
                  id: { type: String, default: null },
                  mime_type: { type: String, default: null },
                },
                context: {
                  forwarded: { type: Boolean, default: null },
                  frequently_forwarded: { type: Boolean, default: null },
                  from: { type: String, default: null },
                  id: { type: String, default: null },
                  referred_product: {
                    catalog_id: { type: String, default: null },
                    product_retailer_id: { type: String, default: null },
                  },
                },
                button: {
                  payload: { type: String, default: null },
                  text: { type: String, default: null },
                },
                audio: {
                  id: { type: String, default: null },
                  mime_type: { type: String, default: null },
                },
              },
            ],
          },
          field: { type: String },
        },
      ],
    },
  ],
  // Add other fields with default values as needed
});

//Assign schema to model
const Notification = mongoose.model("Notification", notificationSchema);

app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || "token";
var received_updates = [];

app.get("/", function (req, res) {
  console.log(req);
  res.send(
    "<h1>" +
      mon +
      "<h1><br><pre>" +
      JSON.stringify(received_updates, null, 2) +
      "</pre>"
  );
});

app.get(["/facebook", "/instagram"], function (req, res) {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == token
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/facebook", (req, res) => {
  console.log("Facebook request body:", req.body);

  if (!req.isXHubValid()) {
    console.log(
      "Warning - request header X-Hub-Signature not present or invalid"
    );
    res.sendStatus(401);
    return;
  }

  console.log("request header X-Hub-Signature validated");
  // Process the Facebook updates here
  const isOutboundNotification =
    req.body?.entry?.[0]?.changes?.[0]?.value?.statuses !== undefined;
  if (isOutboundNotification) {
    console.log("Message delivered/sent/read by customer");
  } else {
    console.log("It is a message notification");
  }
  const newNotification = new Notification(req.body); // Assuming req.body contains user data
  const savedNotification = newNotification.save();
  res.status(200);
  //Save notification to the DB
  received_updates.unshift(req.body);

  //Send Message to MicroService
  //sendMessage();
});

app.post("/instagram", function (req, res) {
  console.log("Instagram request body:");
  console.log(req.body);
  // Process the Instagram updates here
  received_updates.unshift(req.body);
  res.sendStatus(200);
});

async function sendMessage() {
  try {
    const response = await axios({
      method: "post",
      url: `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.BUSINESS_WA_ID}/messages`,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer EAAPrsZAxLVO0BOz1Y3I8yXaykhNf8gTI6sFIk7N13Wged0ij8pyCAK9kOotdv7Lq5ZADjaDIwJ5HQO2pbwGFeUBwdTb5NW1Vf1zrkamNZAEtobbED6XXUxZBK7UzvbY2x7ZCzh7CRM3vy9BzTOS7jYdrtZAywvZChSJpWr795u8FfWglZALj4TZCmbLR5OplZAIZBDmw9ZBHZAErsxJZC6APZAifZBsZD",
      },
      data: {
        messaging_product: "whatsapp",
        to: "27659951223",
        type: "text",
        text: {
          preview_url: true,
          body: "Welcome, thank you for connecting with us on WhatsApp🙂.This an FNB approved banking channel, always make sure to check for our green verified tick. How can we help you today?",
        },
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}
async function saveNotification(req) {
  const newNotification = new Notification(req.body); // Assuming req.body contains user data
  const savedNotification = await newNotification.save();

  console.log(savedNotification);
}
app.listen();
