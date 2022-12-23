const express = require("express");
const router = express.Router();
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const userSchema = Joi.object({
  nickname: Joi.string()
    .min(3)
    .max(30)
    .pattern(new RegExp("[a-z|A-Z|0-9]$"))
    .required(),
  password: Joi.string()
    .min(4)
    .pattern(new RegExp("[a-z|A-Z|0-9]$"))
    .required(),
  confirm: Joi.ref("password"),
});

router.post("/signup", async (req, res) => {
  try {
    const { nickname, password, confirm } = await userSchema.validateAsync(
      req.body
    );
    const check_token = req.cookies.accessToken;
    try {
      jwt.verify(check_token, "sparta-secret-key");
      return res.status(412).json({
        msg: "이미 로그인이 되어있습니다.",
      });
    } catch (e) {
      console.log(e);
    }
    //현재는 닉네임 포함하면 뜨는 오류지만 일정 수 이상 중복이면 뜨게 바꾸는 법을 알고 싶다.
    if (password.includes(nickname)) {
      res.status(412).send({
        errorMessage: "형식에 맞지 않는 비밀번호입니다.",
      });
      return;
    }

    if (password !== confirm) {
      res.status(412).send({
        errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
      });
      return;
    }

    const existsUsers = await User.findOne({ where: { nickname: nickname } });
    if (existsUsers) {
      res.status(412).send({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }
    const password_bcrypt = await bcrypt.hash(password, 12);
    await User.create({ nickname, password: password_bcrypt });

    res.status(201).send({ message: "회원가입에 성공하였습니다." });
  } catch (error) {
    res.status(412).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

module.exports = router;
