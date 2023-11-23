const express = require("express");
const User = require("../models/user");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

const userRoutes = new express.Router();

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

userRoutes.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const users = await User.all();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

/** GET /:username
 *
 * Get details of a user.
 * Only that user can view their get-user-detail
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

userRoutes.get(
  "/:username",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const user = await User.get(req.params.username);
      return res.json({ user });
    } catch (error) {
      return next(error);
    }
  }
);

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

userRoutes.get(
  "/:username/to",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const messages = await User.messagesTo(req.params.username);
      return res.json({ messages });
    } catch (error) {
      return next(error);
    }
  }
);

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

userRoutes.get(
  "/:username/from",
  ensureCorrectUser,
  async function (req, res, next) {
    try {
      const messages = await User.messagesFrom(req.params.username);
      return res.json({ messages });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = userRoutes;
