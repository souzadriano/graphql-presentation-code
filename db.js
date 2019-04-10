const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

mongoose.set('debug', true);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  age: {
    type: Number
  }
});

const User = mongoose.model("User", userSchema);

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = { User, Message };
