require('dotenv').config();
const Token = require('./models/Token');

let isFetchingToken = false;
let currentToken = null;
let currentExpiryDate = null;
let tokenPromise = null;

exports.apiAuthMiddleware = async (req, res, next) => {
    if (currentToken && new Date() < currentExpiryDate) {
        // Token is valid, add it to the request and continue
        console.log("getting token from memory");
        req.token = currentToken;
        next();
    } else {
        if (isFetchingToken) {
            // Another request is already fetching a new token. Wait for the promise to resolve and then try again.
            await tokenPromise;
            req.token = currentToken;
            next();
            return;
        }

        isFetchingToken = true;
        tokenPromise = new Promise(async (resolve, reject) => {
            try {
                // Token is not valid or not present, fetch a new one
                console.log("getting token from db");
                let tokenData = await Token.findOne({});
                if (!tokenData || new Date() >= tokenData.expiry_date) {
                    console.log("fetching new token");
                    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`, {
                        method: 'POST'
                    });
                    const data = await response.json();
                    const newExpiryDate = new Date(new Date().getTime() + data.expires_in * 1000);

                    // Save the new token and expiry date to the database
                    if (!tokenData) {
                        // No token was found in the database, create a new one
                        tokenData = new Token({
                            token: data.access_token,
                            expires_in: data.expires_in,
                            expiry_date: newExpiryDate
                        });
                    } else {
                        // A token was found in the database, update it
                        tokenData.token = data.access_token;
                        tokenData.expires_in = data.expires_in;
                        tokenData.expiry_date = newExpiryDate;
                    }
                    await tokenData.save();

                    // Update the current token and expiry date
                    currentToken = data.access_token;
                    currentExpiryDate = newExpiryDate;
                } else {
                    // Token from the database is valid, use it
                    currentToken = tokenData.token;
                    currentExpiryDate = tokenData.expiry_date;
                }

                // Add the token to the request and continue
                req.token = currentToken;
                next();

                // Resolve the promise
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                isFetchingToken = false;
            }
        });
    }
};