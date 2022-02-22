
const users = require("./data/userdb");
const jwt= require('jsonwebtoken')
const config = process.env;

getRole = (email) => {
     users.getUser (email,function(err,result){
        if (result) {
            return result.role;
        }
    })
  };

const verifyToken = function(roles=[])
{
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    
        if (!token) {
        return res.status(403).send("A token is required for authentication");
        }
        
        try {
            var loggedUser;
            jwt.verify(token, config.TOKEN_KEY, (err, decoded) => {
                if (err) {
                  return res.status(401).send({
                    message: "Unauthorized!"
                  });
                }
                loggedUser=decoded;
              });  
              users.getUser (loggedUser.email,function(err,result){
                if (result) {
                    if (roles.length && !roles.includes(result.role)) {
                        // user's role is not authorized
                        return res.status(401).json({ message: 'Unauthorized, Admin can only access this' });
                    }
                }
            });
            
            next();   
        } 
        catch (err) {
            return res.status(401).send("Invalid Token" + err);
        }
        
    };
}



module.exports = verifyToken;
