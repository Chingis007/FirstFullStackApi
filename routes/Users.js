const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcryptjs = require("bcryptjs");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  bcryptjs.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username: username } });

  if (user) {
    bcryptjs.compare(password, user.password).then((match) => {
      if (!match) {
        return res.json({ error: "Wrong Username And Password Combination" });
      }

      const accessToken = sign(
        { username: user.username, id: user.id },
        "importantsecret"
      );
      res.json({ token: accessToken, username: username, id: user.id });
      return;
    });
  } else {
    res.json({ error: "User Doesn`t Exist" });
  }
});

router.get("/auth", validateToken, (req, res) => {
  res.json(req.user);
});

router.get("/basicinfo/:id", async (req, res) => {
  const id = req.params.id;
  const basicInfo = await Users.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  res.json(basicInfo);
});

router.put("/changepassword", validateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await Users.findOne({ where: { username: req.user.username } });
  bcryptjs.compare(oldPassword, user.password).then((match) => {
    if (!match) {
      return res.json({ error: "Wrong Password Entered!" });
    } else {
      bcryptjs.hash(newPassword, 10).then(async (hash) => {
        await Users.update(
          { password: hash },
          { where: { username: req.user.username } }
        );
        res.json("SUCCESS");
      });
    }
  });
});

module.exports = router;
