const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const client = require("@mailchimp/mailchimp_marketing");
require('dotenv').config();
const weatherApiKey = process.env.apiKey;
const mailchimpApi = process.env.mailchimpApi;
const mailchimpListKey = process.env.mailchimpListKey;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
// 

// Mailchimp
client.setConfig({
    apiKey: mailchimpApi,
    server: "us5",
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
    // res.send("Server is up.")
});

// Weather post request
app.post("/", function (req, res) {
    const query = req.body.cityName;
    const apiKey = weatherApiKey;
    const unit = "metric";
    const url = "https://api.openweathermap.org/data/2.5/weather?appid=" + apiKey + "&units=" + unit + "&q=" + query;// we have to use hhtps://

    https.get(url, function (response) {
        response.on("data", function (data) {
            const weatherData = JSON.parse(data);
            const temp = weatherData.main.temp;
            const description = weatherData.weather[0].description;
            const icon = weatherData.weather[0].icon;
            const imgUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
            // console.log(response.statusCode);
            res.render(__dirname + "/result.html", { query: query, temp: temp, description: description, imgUrl: imgUrl });
        });
    });
});

//Newsletter signup request
app.post("/subscribe", function (req, res) {
    const email = req.body.email;
    // console.log(email);

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    const url = "https://us5.api.mailchimp.com/3.0/lists/" + mailchimpListKey;

    const options = {
        method: "POST",
        auth: "lance1:9f6535c6b3b4129fef3c753082fdda5a-us5",
    }

    const request = https.request(url, options, function (response) {
        // console.log(response.statusCode);
        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html");
        } else {
            res.sendFile(__dirname + "/fail.html");
        }

        // response.on("data", function (data) {
        //     console.log(JSON.parse(data));
        // });
    });

    request.write(jsonData);
    request.end();
});

//Newsletter Signup failure handle
app.post("/failure", function (req, res) {
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running.");
});