/** User class for message.ly */

/** User of the site. */

const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require ('../db');

const bcrypt = require('bcrypt');

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
      
    const timestamp = new Date().toISOString();
    const timestampTimeZone = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query('INSERT INTO users (username, password, first_name, last_name, phone,join_at,last_login_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING username, password, first_name, last_name, phone',[username, hashedPassword, first_name, last_name, phone,timestamp,timestampTimeZone]);
    // const result = await db.query('INSERT INTO users (username, password, first_name, last_name, phone,join_at,last_login_at) VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP::timestamp, CURRENT_TIMESTAMP) RETURNING *',[username, password, first_name, last_name, phone]);

    return result;

  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;