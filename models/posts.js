const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  post: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;
