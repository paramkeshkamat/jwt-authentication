const express = require("express");
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, postController.postPost);
router.get("/", auth, postController.getPost);
router.delete("/:id", auth, postController.deletePost);

module.exports = router;
