const express = require("express");
const router = express.Router();
const { User, Comment, Post } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  const existsPosts = await Comment.findAll({
    where: { postId },
    order: [["updatedAt", "DESC"]],
  });
  const mapComments = existsPosts.map((data) => {
    return {
      commentId: data.commentId,
      nickname: data.nickname,
      comment: data.comment,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  });
  res.json({ mapComments });
});

router.post("/comments/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { user } = res.locals;
  if (req.body.comment === "") {
    res
      .status(400)
      .json({ success: false, errorMessage: "댓글 내용을 입력해주세요" });
  } else {
    await Comments.create({
      postId: postId,
      nickname: user.nickname,
      comment: req.body.comment,
    });
    res.status(201).send({ message: "댓글 등록이 완료되었습니다." });
  }
});

router.put("/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { nickname } = res.locals;
    const { comment } = req.body;

    const existsComment = await Comment.findOne({
      where: { commentId, nickname },
    });
    if (comment === "") {
      res
        .status(400)
        .json({ success: false, errorMessage: "댓글 내용을 입력해주세요" });
    }
    if (existsComment) {
      await Comment.update({ comment }, { where: { commentId, nickname } });
      res.send({ message: "댓글을 수정하였습니다." });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: "본인의 댓글만 수정할 수 있어요!",
      });
    }
  } catch (e) {
    return res.status(400).json({ success: false });
  }
});

router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { nickname } = res.locals.user;
    const existsComment = await Comment.findOne({
      where: { commentId, nickname },
    });
    if (existsComment) {
      await Comment.destroy({ where: { commentId } });
      res.send({ result: "success", message: "댓글을 삭제하였습니다." });
    } else {
      res.status(400).json({
        success: false,
        errorMessage: "본인의 댓글만 삭제할 수 있어요!",
      });
    }
  } catch (e) {
    return res.status(400).json({ result: "fail" });
  }
});

module.exports = router;
