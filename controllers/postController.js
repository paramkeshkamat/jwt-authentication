const Post = require("../models/posts");

const postPost = async (req, res) => {
  const { post } = req.body;
  const username = req.username;
    try {
      const newPost = new Post({ username, post });
      const addedPost = await newPost.save();
      res.status(201).json(addedPost);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

const getPost = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.deleteOne({ _id: req.params.id });
    res.status(200).json(deletedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { postPost, getPost, deletePost };
