const express = require("express");
const cookie_parser = require("cookie-parser");

const app = express();
const router = express.Router();

app.use(express.json());
app.use(cookie_parser());
app.use("/", express.urlencoded({ extended: false }), router);
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const signupRouter = require("./routes/signup");
const loginRouter = require("./routes/login");

app.use("/", [postsRouter, commentsRouter, signupRouter, loginRouter]);

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});
