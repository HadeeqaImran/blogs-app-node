const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    credentials: {
      accessKeyId: keys.accessKeyId,
      secretAccessKey: keys.secretAccessKey,
    },
    region: 'eu-north-1',
});

module.exports = app => {
    app.get('/api/upload', requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;
        s3.getSignedUrl('putObject', {
            Bucket: 'node-blogs',
            ContentType: 'image/jpeg',
            Key: key,
        }, (err, url) => 
            {if(err){
                console.log("error", err)
                console.log("keys.accessKeyId",keys.accessKeyId)

            }
            res.send({ key, url })});
    });
}

// For the key parameter, we generate random strings because if users upload different images with the same names then there is a chance that the older file will be overwritten.
// Amazon bucket is a flat file store (it does not inherently have idea of folders.) but if a file has a / character then it will act as a folder. We can do this by prefixing a user's files with its user Id.