/**
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var xhub = require("express-x-hub");
const axios = require("axios");

app.set("port", process.env.PORT || 5000);
app.listen(app.get("port"));

app.use(xhub({ algorithm: "sha1", secret: process.env.APP_SECRET }));
app.use(bodyParser.json());

var token = process.env.TOKEN || "token";
var received_updates = [];

app.get("/", function (req, res) {
  console.log(req);
  res.send("<pre>" + JSON.stringify(received_updates, null, 2) + "</pre>");
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

app.post("/facebook", async (req, res) => {
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
  res.status(200);
  //Save notification to the DB
  const isOutboundNotification =
    req.body?.entry?.[0]?.changes?.[0]?.value?.status !== undefined;

  if (isOutboundNotification) {
    console.log("Message delivered/sent/read by customer");
  } else {
    console.log("It is a message notification");
  }
  received_updates.unshift(req.body);
  //Send Message to MicroService
  //sendMessage();

  /*const {
    entry: {
      changes: {
        messages: { from },
      },
    },
  } = req.body;
*/
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

app.listen();
