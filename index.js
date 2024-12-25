const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.post("/")
app.use(bodyParser.json());
require('dotenv').config();
const {
  processLeadCreation
} = require('./controllers/leadController');

const {
  createWebhookSubscription
} = require('./services/calendlyWebhookService')



createWebhookSubscription();

app.post('/webhook', processLeadCreation)


app.listen(3000, () => {
  console.log("Server is running on Port 3000")
})