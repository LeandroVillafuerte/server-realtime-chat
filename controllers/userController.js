import User from "../model/userModel.js";
import bcrypt from "bcrypt";

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res
        .status(400)
        .send({ msg: "Username already exists", status: false });

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res
        .status(400)
        .json({ msg: "Email already exists", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    delete user.password;

    return res.status(200).json({ msg: "User created", user, status: true });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .send({ msg: "Incorrect password or username", status: false });

    console.log("sss",user.password)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res
        .status(404)
        .send({ msg: "Incorrect password or username", status: false });

    delete user.password;

    return res.status(200).json({ msg: "User Logged in", user, status: true });
  } catch (e) {
    next(e);
  }
};

export { register, login };
