import User from "../model/userModel.js";
import bcrypt from "bcrypt";
import { Buffer } from "buffer";
import axios from "axios";
import { randomCharacter } from "../tools/utils.js";

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

const getAvatars = async (req, res, next) => {
  try {
    const avatars = [];
    const api = "https://source.boringavatars.com/beam/120";
    for (let i = 0; i < 4; i++) {
      const image = await axios.get(
        `${api}/${randomCharacter(7) + Math.round(Math.random() * 1000)}`
      );
      const buffer = new Buffer.from(`${image.data}`);
      avatars.push(buffer.toString("base64"));
    }
    return res
      .status(200)
      .json({ msg: "avatars fetched", avatars, status: true });
  } catch (e) {
    next(e);
  }
};

const setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.status(200).json({
      msg: "User updated!",
      isAvatarImageSet: userData.isAvatarImageSet,
      avatarImage: userData.avatarImage,
    });
  } catch (e) {
    next(e);
  }
};

const getContacts = async (req, res, next) => {
  try {
    const contacts = await User.findOne({ _id: req.params.id }).select([
      "contacts",
    ]);
    const users = await User.find({
      _id: { $in: contacts.contacts },
    }).select(["email", "username", "avatarImage", "_id"]);
    console.log(users);
    return res.status(200).json({ msg: "users fetched", users });
  } catch (e) {
    next(e);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { currentUserId, newContact } = req.body;
    const contact = await User.findOne({
      $or: [{ username: newContact }, { email: newContact }],
    }).select(["_id", "contacts"]);

    if (!contact) {
      return res.status(400).json({ msg: "This user doesn't exist." });
    }
    if(contact._id == currentUserId){
      return res.status(400).json({msg:"Invalid contact."})
    }
    if (contact.contacts.includes(currentUserId)) {
      return res
        .status(400)
        .json({ msg: "This user is already your contact." });
    }

    const updatedContact = await User.findByIdAndUpdate(
      { _id: contact._id },
      { $push: { contacts: currentUserId } }
    );
    if (!updatedContact)
      return res.status(400).json({ msg: "Unexpected Error." });

    const updatedUser = await User.findByIdAndUpdate(
      { _id: currentUserId },
      { $push: { contacts: contact._id } }
    ).select(["_id", "contacts"]);
    if (!updatedUser) return res.status(400).json({ msg: "Unexpected Error." });

    return res.status(200).json({ msg: "User added.", updatedUser });
  } catch (e) {
    next(e);
  }
};

export { register, login, getAvatars, setAvatar, getContacts, addContact };
