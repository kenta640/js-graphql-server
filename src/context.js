const jwksClient = require('jwks-rsa')
const jwt = require('jsonwebtoken')


const options = {
    audience: process.env.API_IDENTIFIER,
    issuer: process.env.AUTH0_DOMAIN,
    algorithms: ['RS256']
  }

const client = jwksClient({
jwksUri: process.env.JWT_KEY_SET
})
  
function getKey(header, cb){
client,getSigningKey(header.kid, function(err, key){
    var signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey)
})
}
module.exports = async({ req }) => {
    // simple auth check on every request
    const token = req.headers.authorization;
    const user = new Promise((resolve, reject) => {
      jwt.verify(token, getKey, options, (err, decoded) => {
        if(err) {
          return reject(err);
        }
        resolve(decoded.email);
      });
    });

    return {
      user
    };
  
  }