const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;   //create a new type: Currency

const promosSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true  //this will add 'created at' and 'updated at', 2 timestamps into each document
});

var Promos = mongoose.model('Promo', promosSchema);

module.exports = Promos;