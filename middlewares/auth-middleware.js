const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      errorMessage: "로그인 후 사용이 가능한 API 입니다.",
    });
  }

  const userId = jwt.verify(accessToken, "sparta-secret-key");
  const user = await User.findOne({ nickname: userId.nickname });
  res.locals.user = user;
  next();

  // res.status(400).json({
  //   errorMessage: "로그인 후 사용이 가능한 API 입니다.",
  // });

  return;
};
