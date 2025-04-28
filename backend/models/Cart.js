// backend/models/Cart.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        items: [
            {
                course: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                },
                isWishlisted: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
    },
    { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;