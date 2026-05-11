require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors()); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Models
const User = require('./models/User');
const Order = require('./models/Order');
const Product = require('./models/Product');

// ==========================================
// --- PRODUCT APIs ---
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ id: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// --- AUTH APIs ---
// ==========================================
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ name, email, password });
        await newUser.save();
        
        const { password: userPassword, ...safeUserData } = newUser._doc;
        res.status(201).json({ message: "User registered successfully", user: safeUserData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const { password: userPassword, ...safeUserData } = user._doc;
        res.json({ message: "Login successful", user: safeUserData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// --- ORDER APIs ---
// ==========================================
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, items, total, address, paymentMethod } = req.body;
        const count = await Order.countDocuments();
        const orderId = `#ORD-${String(count + 1).padStart(4, '0')}`;

        const newOrder = new Order({ orderId, userId, items, total, address, paymentMethod });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// --- ADMIN APIs ---
// ==========================================
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        // ADD estimatedDelivery here vvvvvv
        const { userId, items, total, address, paymentMethod, estimatedDelivery } = req.body;
        const count = await Order.countDocuments();
        const orderId = `#ORD-${String(count + 1).padStart(4, '0')}`;

        // ADD estimatedDelivery here vvvvvv
        const newOrder = new Order({ orderId, userId, items, total, address, paymentMethod, estimatedDelivery });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));