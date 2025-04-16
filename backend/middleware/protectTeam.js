const jwt = require('jsonwebtoken');

const protectTeam = (req, res, next) => {
  // Get the token from Authorization header
  const token = req.headers.authorization?.split(' ')[1]; // Assuming token is sent as 'Bearer <token>'
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized, token missing' });
  }

  try {
    // Verify the token with your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded data to the request object
    req.user = decoded; 

    // Move on to the next middleware/handler
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized, token invalid' });
  }
};

module.exports = { protectTeam };
