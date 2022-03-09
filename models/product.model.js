const mongoose = require('mongoose');

module.exports = mongoose.model('product', {
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    specifications: {
        type: [String],
    },
    category: {
        type: String,
        required: [true, 'Mobile is required'],
        enum: ['Mobiles', 'Washing Machines']
    },
    imgSrc: {
        type: String,
        required: [true, 'Img Src is required'],
    },
    inStock: {
        type: String,
        default: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    reviewIds: [{type: mongoose.Schema.ObjectId, ref: 'review'}]
});