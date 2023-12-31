const express = require("express");
const { communityController } = require("../controllers");
const { getCommentController } = require("../controllers/communityControllers");
const { validateToken } = require("../middlewares/auth");
const {
  getAllPostController,
  createPostController,
  deletePostController,
  createCommentController,
  deleteCommentController,
  getPostListController,
} = communityController;

const communityRoute = express.Router();

communityRoute.use(validateToken);

communityRoute.get("/", getPostListController);
communityRoute.post("/post", createPostController);
communityRoute.delete("/post", deletePostController);
communityRoute.get("/:postId", getAllPostController);
communityRoute.post("/comment", createCommentController);
communityRoute.delete("/comment", deleteCommentController);
communityRoute.get("/comment/:postId", getCommentController);

module.exports = { communityRoute };
