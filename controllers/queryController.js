const query = async (req, res, next) => {
  try {
    return res.status(200).json({ msg: "Yay!" });
  } catch (e) {
    next(e);
  }
};

export { query };
