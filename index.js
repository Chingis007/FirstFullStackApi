const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 7544;
const db = require("./models");

//Routers
const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);
const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);
const commentsRouter = require("./routes/Comments");
app.use("/comments", commentsRouter);
const likesRouter = require("./routes/Likes");
app.use("/likes", likesRouter);
console.log("starting sequelize.sinc()");
db.sequelize
  .sync()
  .then(() => {
    console.log("synchronized");
    app.listen(port, () => {
      console.log(`Server running on port: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
