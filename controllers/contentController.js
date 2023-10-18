const User = require('../models/userModel')

exports.getContent = async (req, res) => {
  const content = await Content.find();
  res.render('index', { content })
};