const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

let history = [];

// Fetch gold price
async function getGoldPrice() {
    const res = await axios.get("https://www.goldapi.io/api/XAU/USD", {
        headers: { "x-access-token": process.env.GOLD_API_KEY }
    });

    const price = res.data.price;

    history.push(price);
    if (history.length > 30) history.shift();

    return price;
}

// Average
function avg(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Status
function status(price) {
    if (history.length < 5) return "Collecting data...";

    const average = avg(history);

    if (price > average) return "HIGH 📈";
    if (price < average) return "LOW 📉";
    return "NORMAL";
}

// Prediction
function predict() {
    if (history.length < 5) return "Not enough data";

    const trend = history[history.length - 1] - history[0];

    if (trend > 0) return "UPTREND 📈";
    if (trend < 0) return "DOWNTREND 📉";
    return "SIDEWAYS";
}

app.get("/gold", async (req, res) => {
    try {
        const price = await getGoldPrice();

        res.json({
            price,
            status: status(price),
            prediction: predict()
        });
    } catch (err) {
        res.status(500).send("Error");
    }
});

app.listen(3000, () => console.log("Running"));