const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    // console.log("user", user)
    const sessionObject = {
        passport: {
            user: user._id.toString() // user._id is an ObjectId, so we need to convert it to a string
            // user: "67c22a5e4b04ddbb44a6ee7d"
        }
    };
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const sig = keygrip.sign('session=' + session).toString('base64');
    return { sig, session: session };
}