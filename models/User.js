const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, 
    },
    password: {
      type: String,
      required: true,
    },
    phone: { 
      type: Number,
      
    },
     role: {
      type: String,
      enum: ['user', 'host', 'admin'],
      default:"user",
     
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;

