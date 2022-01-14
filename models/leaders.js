const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadersSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true,
        default: ''
    },
    abbr: {
        type: String,
        required: true,
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

var Leaders = mongoose.model('Leader', leadersSchema);

module.exports = Leaders;