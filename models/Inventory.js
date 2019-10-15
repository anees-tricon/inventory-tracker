const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const InventorySchema = new Schema({
  name:{
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  quantityType: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

mongoose.model('inventory', InventorySchema);