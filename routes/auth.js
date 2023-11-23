const express = require("express");
const authRoutes = new express.Router();
const User = require("../models/user");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

authRoutes.post("/login/", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const validLogin = await User.authenticate(username, password);

    if (validLogin) {
      const token = await User.createToken(username);
      //PEER seems okay to remove this "await" in line 20, since the program doesn't need .updateLoginTimestamp() to finish to proceed?
      await User.updateLoginTimestamp(username);
      return res.json(token);
    }
    //PEER To trigger an error, should I use the next() function below,
    // Or should I use throw new ExpressError("Invalid user/password", 400)?
    else {
      return next({
        status: 400,
        message: "Invalid user/password.",
      });
    }
  } catch (error) {
    return next(error);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

authRoutes.post("/register/", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    const userExists = await User.get(username);
    if (!userExists) {
      const result = await User.register({
        username,
        password,
        first_name,
        last_name,
        phone,
      });
      const token = await User.createToken(result.username);
      return res.json(token);
    } else {
      return next({
        status: 400,
        message: "Username already taken.",
      });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = authRoutes;
