const express = require("express");
const messageRoutes = new express.Router();

const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");
const ExpressError = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

messageRoutes.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    // Schema Validation - Verify 'id' parameter is a number.
    if (isNaN(req.params.id)) {
      return next({
        status: 400,
        message: "Bad Request.",
      });
    }
    // Validate message exists and correct user
    const message = await Message.getMessageByIdandUser(req.params.id,req.user.username);

    if (!message) {
      return next({
        status: 400,
        message: "Bad Request.",
      });
    }
    else {
      const messageDetails = await Message.get(req.params.id);
      return res.json({ messageDetails });
    }
  } catch (error) {
    next(error);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

messageRoutes.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const { to_username, body } = req.body;
    const result = await Message.create(req.user.username, to_username, body);
    return res.json({ message: result });
  } catch (error) {
    return next(error);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

messageRoutes.post(
  "/:id/read",
  ensureLoggedIn,
  async function (req, res, next) {

    //PEER Any suggestions on how to optimize the validations here?

    try {
      // Schema Validation - Verify 'id' parameter is a number.
      if (isNaN(req.params.id)) {
        return next({
          status: 400,
          message: "Bad Request.",
        });
      }
      // Validate message id, correct user, and read status
      const message = await Message.findUnreadMessageByIdAndUser(req.params.id,req.user.username);
      if (!message) {
        return next({
          status: 400,
          message: `Bad Request. Either no such message with an id of ${req.params.id}, you don't have access to the message, or the message is already read.`,
        });
      }
      else {
        const updatedMessage = await Message.markRead(req.params.id);
        return res.status(200).json({ result: updatedMessage }); 
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = messageRoutes;
