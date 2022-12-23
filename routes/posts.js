const express = require("express");
const router = express.Router();
const { Post, Like } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

//1. 전체 게시글 목록 조회 API
router.get("/posts", async (req, res) => {
  const data = await Post.findAll({ order: [["updatedAt", "DESC"]] });

  const mapData = data.map((data) => {
    return {
      postId: data.postId,
      nickname: data.nickname,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      likes: data.likes,
    };
  });
  res.json({ data: mapData });
});

//3. 라잌 게시글 목록 조회 API
router.get("/posts/like", authMiddleware, async (req, res) => {
  const { nickname } = res.locals.user;
  const arrLike = await Like.findAll({ where: { nickname } });
  const arrPostId = arrLike.map((val) => {
    return val.postId;
  });
  const data = await Posts.findAll({
    where: { postId: arrPostId },
    order: [["likes", "DESC"]],
  });
  const mapData = data.map((data) => {
    return {
      postId: data.postId,
      nickname: data.nickname,
      title: data.title,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      likes: data.likes,
    };
  });
  res.json({ data: mapData });
});

//4. 라잌/디스라잌 게시글 API
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { nickname } = res.locals.user;
  const is_liked = await Like.findOne({ where: { postId, nickname } });

  if (is_liked) {
    await Like.destroy({ where: { postId, nickname } });
    const post = await Post.findOne({ where: { postId } });
    likesnum = post.likes * 1 - 1;
    await Post.update({ likes: likesnum }, { where: { postId } });
    res.send({
      result: "success",
      message: "게시글의 좋아요를 취소하였습니다.",
    });
  } else {
    /*신규*/
    const post = await Post.findOne({ where: { postId } });
    likesnum = post.likes * 1 + 1;
    await Like.create({ postId, nickname });
    await Post.update({ likes: likesnum }, { where: { postId } });
    res.send({
      result: "success",
      message: "게시글의 좋아요를 등록하였습니다.",
    });
  }
});

//2. 게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const data = await Post.findAll({});

  const filteredPosts = data.filter((x) => {
    return x["postId"].toString() === postId;
  });
  const mapPosts = filteredPosts.map((data) => {
    return {
      postId: data.postId,
      nickname: data.nickname,
      title: data.title,
      content: data.content,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      likes: data.likes,
    };
  });
  res.json({ mapPosts });
});
//5. 게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const existPosts = await Post.findAll({ order: [["postId", "DESC"]] });

    if (existPosts.length !== 0) {
      postId = existPosts[0].postId + 1;
      await Post.create({
        postId: postId,
        nickname: user.nickname,
        title: req.body.title,
        content: req.body.content,
        likes: 0,
      });
      res.status(201).send({ message: "게시글 작성에 성공하였습니다." });
    } else {
      await Post.create({
        postId: 1,
        nickname: user.nickname,
        title: req.body.title,
        content: req.body.content,
        likes: 0,
      });
      res.status(201).send({ message: "게시글 작성에 성공하였습니다." });
    }
  } catch (Error) {
    return res.status(400).json({ message: "게시글 작성에 실패하였습니다." });
  }
});

//6. 게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { content, title } = req.body;
  const existsPost = await Post.findOne({ where: { postId } });

  if (existsPost) {
    await Post.update({ content, title }, { where: { postId } });
    res.send({ result: "success", message: "게시글을 수정하였습니다." });
  } else {
    res.send({ result: "fail" });
  }
});

//7. 게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const existsPost = await Post.findOne({ postId });
  if (existsPost) {
    await Post.destroy({ where: { postId } });
    res.send({ result: "success", message: "게시글을 삭제하였습니다." });
  } else {
    res.send({ result: "fail" });
  }
});

module.exports = router;
