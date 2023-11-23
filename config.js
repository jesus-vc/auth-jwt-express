/** Common config for message.ly */

// read .env files and make environmental variables

require("dotenv").config();

const DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///messagely_test"
    : "postgresql:///messagely";

const SECRET_KEY = process.env.SECRET_KEY || "secret3!&%#";

const BCRYPT_WORK_FACTOR = 12;

const JWT_OPTIONS = { expiresIn: 60 * 60 * 12 }; // 12 hours

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
  JWT_OPTIONS,
};
