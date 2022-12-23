const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const { User } = require("../models");

router.use(cookieParser());

let tokenObject = {}; // Refresh Token을 저장할 Object

router.post("/auth", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({ nickname });
  const key = await bcrypt.compare(password, user.password);

  if (!user || !key) {
    return res.status(400).json({
      errorMessage: "사용자가 존재하지 않거나, 비밀번호를 확인해주세요.",
    });
  }

  const accessToken = jwt.sign(
    { nickname: user.nickname },
    "sparta-secret-key",
    {
      expiresIn: "1d",
    }
  );
  const refreshToken = jwt.sign({}, "sparta-secret-key", { expiresIn: "7d" });

  res.cookie("accessToken", accessToken);
  res.cookie("refreshToken", refreshToken);

  return res.status(200).json({ success: true, accessToken });
});

router.get("/get-token", (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res
      .status(400)
      .json({ message: "Refresh Token이 존재하지 않습니다." });
  if (!accessToken)
    return res
      .status(400)
      .json({ message: "Access Token이 존재하지 않습니다." });

  const isAccessTokenValidate = validateAccessToken(accessToken);
  const isRefreshTokenValidate = validateRefreshToken(refreshToken);

  if (!isRefreshTokenValidate)
    return res.status(419).json({ message: "Refresh Token이 만료되었습니다." });

  if (!isAccessTokenValidate) {
    const accessTokenId = tokenObject[refreshToken];
    if (!accessTokenId)
      return res
        .status(419)
        .json({ message: "Refresh Token의 정보가 서버에 존재하지 않습니다." });

    const newAccessToken = createAccessToken(accessTokenId);
    res.cookie("accessToken", newAccessToken);
    return res.json({ message: "Access Token을 새롭게 발급하였습니다." });
  }

  const { id } = getAccessTokenPayload(accessToken);
  return res.json({
    message: `${id}의 Payload를 가진 Token이 성공적으로 인증되었습니다.`,
  });
});

// Access Token을 검증합니다.
function validateAccessToken(accessToken) {
  try {
    jwt.verify(accessToken, "sparta-secret-key"); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Refresh Token을 검증합니다.
function validateRefreshToken(refreshToken) {
  try {
    jwt.verify(refreshToken, "sparta-secret-key"); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Access Token의 Payload를 가져옵니다.
function getAccessTokenPayload(accessToken) {
  try {
    const payload = jwt.verify(accessToken, "sparta-secret-key"); // JWT에서 Payload를 가져옵니다.
    return payload;
  } catch (error) {
    return null;
  }
}

module.exports = router;
