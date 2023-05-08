import Message from "../model/messageModel.js";

const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Message.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });
    if (data) return res.status(201).json({ msg: "Message added." });
    return res.status(500).json({ msg: "Failed to add message." });
  } catch (e) {
    next(e);
  }
};

const getAllMessages = async (req, res, next) => {
  try {
    const { from, to } = req.params;
    const messages = await Message.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    return res.status(200).json({ projectMessages });
  } catch (e) {
    next(e);
  }
};

export { addMessage, getAllMessages };
