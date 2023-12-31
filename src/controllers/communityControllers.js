const { throwError } = require("../utils/throwError");
const { communityService } = require("../services");
const {
  createPostService,
  deletePostService,
  createCommentService,
  getAllPostService,
  deleteCommentService,
  getPostListService,
  getCommentService,
} = communityService;

const createPostController = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { content, img_url } = req.body;
    if (!userId) return res.status(400).json({ message: "KEY_ERROR" });
    if (!content) return res.status(400).json({ message: "NO_CONTENT" });
    return res.status(200).json({
      message: "CREATE_POST",
      data: await createPostService(userId, content, img_url),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deletePostController = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { postId } = req.body;
    if (!userId || !postId)
      return res.status(400).json({ message: "KEY_ERROR" });
    return res.status(200).json({
      message: "DELETE_POST",
      data: await deletePostService(userId, postId),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getAllPostController = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    if (!userId) return res.status(400).json({ message: "KEY_ERROR" });
    if (!postId) return res.status(400).json({ message: "NO_POST" });
    return res.status(200).json({
      message: "GET_POST",
      data: await getAllPostService(userId, postId),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const createCommentController = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { postId, content } = req.body;
    if (!userId || !content || !postId)
      return res.status(400).json({ message: "KEY_ERROR" });
    return res.status(200).json({
      message: "CREATE_COMMENT",
      data: await createCommentService(userId, content, postId),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const deleteCommentController = async (req, res, next) => {
  try {
    const { postId, commentId } = req.body;
    if (!postId) return res.status(400).json({ message: "KEY_ERROR" });
    if (!commentId) return res.status(400).json({ message: "NO_COMMENT" });
    return res.status(200).json({
      message: "DELETE_COMMENT",
      data: await deleteCommentService(postId, commentId),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getPostListController = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (userId === undefined) res.status(400).json({ message: "KEY_ERROR" });
    const data = await getPostListService(userId);
    res.status(200).json({ message: "GET_POST", data: data });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getCommentController = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    if (!postId) return res.status(400).json({ message: "KEY_ERROR" });
    return res.status(200).json({
      message: "GET_COMMENT",
      data: await getCommentService(userId, Number(postId)),
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};
module.exports = {
  createPostController,
  deletePostController,
  getAllPostController,
  createCommentController,
  deleteCommentController,
  getPostListController,
  getCommentController,
};
