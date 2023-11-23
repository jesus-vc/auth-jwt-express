/** User class for message.ly */

/** User of the site. */

const { BCRYPT_WORK_FACTOR, SECRET_KEY, JWT_OPTIONS } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    //PEER Should I keep these two variables in lines 18 and 19 or remove them by replacing line 26 with line 38?
    const timestamp = new Date().toISOString();
    const timestampTimeZone = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      "INSERT INTO users (username, password, first_name, last_name, phone,join_at,last_login_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING username, password, first_name, last_name, phone",
      [
        username,
        hashedPassword,
        first_name,
        last_name,
        phone,
        timestamp,
        timestampTimeZone,
      ]
    );
    // const result = await db.query('INSERT INTO users (username, password, first_name, last_name, phone,join_at,last_login_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP::timestamp, CURRENT_TIMESTAMP) RETURNING *',[username, password, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** generates and returns JWT token */

  static async createToken(username) {
    const token = jwt.sign({ username }, SECRET_KEY, JWT_OPTIONS);
    return token;
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      "SELECT password FROM users WHERE username=$1",
      [username]
    );
    const hashedPassword = result.rows[0];
    return (
      hashedPassword &&
      (await bcrypt.compare(password, hashedPassword.password))
    );
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const timestampTimeZone = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    await db.query(
      "UPDATE users SET last_login_at=$1 WHERE username=$2 RETURNING username",
      [timestampTimeZone, username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    const users = await db.query(
      "SELECT username,first_name,last_name,phone FROM users"
    );
    return users.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const users = await db.query(
      "SELECT username,first_name,last_name,phone, join_at, last_login_at FROM users WHERE username=$1",
      [username]
    );

    return users.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const messages = await db.query(
      "SELECT id, body,sent_at,read_at, users.username, users.first_name, users.last_name, users.phone FROM messages JOIN users ON to_username=users.username WHERE from_username=$1",
      [username]
    );

    const restructuredMessages = messages.rows.map((o) => ({
      id: o.id,
      body: o.body,
      sent_at: o.sent_at,
      read_at: o.read_at,
      to_user: {
        username: o.username,
        first_name: o.first_name,
        last_name: o.last_name,
        phone: o.phone,
      },
    }));

    return restructuredMessages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messages = await db.query(
      "SELECT id, body,sent_at,read_at,users.username, users.first_name, users.last_name, users.phone FROM messages JOIN users ON from_username=users.username WHERE to_username=$1",
      [username]
    );

    const restructuredMessages = messages.rows.map((o) => ({
      id: o.id,
      body: o.body,
      sent_at: o.sent_at,
      read_at: o.read_at,
      from_user: {
        username: o.username,
        first_name: o.first_name,
        last_name: o.last_name,
        phone: o.phone,
      },
    }));
    return restructuredMessages;
  }
}

module.exports = User;
