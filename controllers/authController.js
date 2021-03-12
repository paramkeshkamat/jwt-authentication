const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleErrors = (err) => {
  const errors = { username: "", email: "", password: "" };

  if (err.code === 11000) {
    if (err.message.includes("username")) {
      errors.username = "This username already exists";
    } else if (err.message.includes("email")) {
      errors.email = "This email already exists";
    }
  }
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const signup = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      res.status(400).json({
        errors: {
          username: "",
          email: "",
          password: "Passwords do not match",
        },
      });
    } else {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({ username, email, password: hashedPassword });
      const newUser = await user.save();
      const token = jwt.sign(
        { user: newUser._id, username: newUser.username },
        process.env.JWT_SECRET,
        { expriesIn: 3 * 24 * 60 * 60 } //3 days in seconds
      );
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, //3 days in miliseconds
      });
      res.status(201).json(newUser);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).send({ errors });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please enter email and password" });
    }
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    const correctPassword = await bcrypt.compare(password, validUser.password);
    if (!correctPassword) {
      return res.status(401).json({ message: "Wrong email or password" });
    }
    const token = jwt.sign(
      { user: validUser._id, username: validUser.username },
      process.env.JWT_SECRET,
      { expriesIn: 3 * 24 * 60 * 60 }
    );
    res.cookie("token", token, { 
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });
    res.status(200).send("Successfully logged in!");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.send("successfully logged out!");
};

const isLoggedIn = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.send(false);
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.send(verified.username);
  } catch (err) {
    res.sen(false);
  }
};

module.exports = { signup, login, logout, isLoggedIn };
