const passport = require("passport");
const jwt = require("jsonwebtoken");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { User } = require("../models");
require("dotenv").config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// JWT Strategy configuration
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await User.findByPk(jwtPayload.id);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// Custom authentication function
const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !user.validatePassword(password)) {
      return null; // Invalid credentials
    }

    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin, // Include isAdmin in the payload
    };
  } catch (error) {
    return null; // Error during authentication
  }
};

// Custom function to generate a JWT token
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin === true) {
    return next();
  } else {
    return res
      .status(403)
      .json({ message: "Access forbidden. Admin privileges required." });
  }
};

module.exports = { passport, authenticateUser, generateToken, isAdmin };

