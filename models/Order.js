const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: Array, required: true },
    total: { type: Number, required: true },
    address: { type: Object },
    paymentMethod: { type: String },
    estimatedDelivery: { type: String },
    status: { type: String, default: "Accepted" },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);