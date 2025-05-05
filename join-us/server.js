const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const joinRoutes = require('./routes/joinRoute');
const path = require('path');
require("dotenv").config();
const axios = require("axios");
const Payment = require("./models/paymentModel");


const app = express();
const PORT = process.env.PORT || 5000;

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Connect DB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection
mongoose.connect('mongodb://localhost:27017/ysn_db').then(() => console.log("Connected to MongoDB"));

// Routes
app.use('/api', require('./routes/applicantRoute'));

app.use('/api', require('./routes/messageRoute'));

// Message model
const Message = require("./models/Message");

// Use Routes
app.use('/api', require('./routes/summitRoute'));

app.use('/api', require('./routes/chapterRoute'));

// Routes
app.use('/api', joinRoutes);

// Serve static files (optional)
app.use(express.static(__dirname));


// Socket.IO Events
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Forward user message to admin
    socket.on("new_message", (data) => {
        io.emit("new_message", data);
    });

    // User sends live message
    socket.on("user_typing", (data) => {
        io.emit("user_typing", data);
    });

    // Coordinator replies
    socket.on("coordinator_reply", (data) => {
        io.emit("coordinator_reply", data);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const generateToken = async(req, res, next) => {
    const secret = process.env.MPESA_SECRET_KEY;
    const consumer = process.env.MPESA_CONSUMER_KEY;

    if (!secret || !consumer) {
        return res.status(500).json({ error: "Missing M-Pesa credentials." });
    }

    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    try {
        const response = await axios.get(
            "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        req.token = response.data.access_token; // Pass token via request object
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ error: "Failed to generate token", details: err.message });
    }
};

app.get("/donate", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "donate.html"));
});

//middleware function to generate token
app.post("/stk", generateToken, async(req, res) => {
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;

    const date = new Date();
    const timestamp =
        date.getfullYear() +
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;


    const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");
    await axios.post(
            "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline", //" CustomerBuyGoodsOnline"
                Amount: amount,
                PartyA: `254${phone}`,
                PartyB: shortcode,
                PhoneNumber: `254${phone}`,
                CallBackURL: "https://c00d-197-232-62-147.ngrok-free.app/callback",
                AccountReference: `254${phone}`,
                TransactionDesc: "Payment for Youth Synergy Network",
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
        .then((data) => {
            console.log(data.data);
            res.status(200).json(data.data);
        })
        .catch((err) => {
            console.log(err.message);
            res.status(400).json(err.message);
        });
});

app.post("/callback", (req, res) => {
    const callbackData = req.body;
    console.log(callbackData.Body);
    if (!callbackData.Body.stkCallback.CallbackMetadata) {
        console.log(callbackData.Body);
        res.json("Okay");
    }
    console.log(callbackData.Body.stkCallback.CallbackMetadata);

    const phone = callbackData.Body.stkCallback.CallbackMetadataItem[4].value;
    const trnx_id = callbackData.Body.stkCallback.CallbackMetadataItem[1].value;
    const amount = callbackData.Body.stkCallback.CallbackMetadataItem[0].value;

    console.log({
        phone,
        trnx_id,
        amount
    });

    const payment = new Payment();

    payment.number = phone;
    payment.amount = amount;
    payment.trnx_id = trnx_id;

    payment
        .save()
        .then((data) => {
            console.log({
                message: "Saved Successfully",
                data
            });
        })
        .catch((err) => {
            console.log(err.message);
        });
});

// Add this after your other routes
app.get("/transactions", async(req, res) => {
    try {
        const transactions = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// previous summit highlights route
app.get("/api/summits", async(req, res) => {
    try {
        const summits = await Summit.find().sort({ year: -1 });
        res.json(summits);
    } catch (err) {
        res.status(500).json({ message: "Error fetching summits" });
    }
});