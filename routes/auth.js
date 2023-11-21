/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

const express = require('express');

const User = require('../models/user');


const authRoutes = new express.Router();

authRoutes.post('/register/', async function (req, res, next) {
    try {
        const {username,password,first_name,last_name,phone} = req.body;

        const result = await User.register({username,password,first_name,last_name,phone});
                
        // use result to generate a token and return to user
        //this means loggin in the user. so create a function.

        return res.json(result.rows);

    }
    catch (err) {
        next(err);
    }
});

module.exports = authRoutes;