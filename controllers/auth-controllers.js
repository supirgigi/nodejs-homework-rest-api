const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const jimp = require('jimp');
const { nanoid } = require('nanoid');

const { ctrlWrapper } = require('../utils');
const { HttpError, sendEmail } = require('../helpers');
const { User } = require('../models/user');

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, 'Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const result = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: 'Please, confirm your email',
    html: `<a target="_blank" href="${BASE_URL}/auth/verify/${verificationToken}">Click here to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: result.email,
      subscription: result.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: '',
  });

  res.json({
    message: 'Verification successful',
  });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  const verifyEmail = {
    to: email,
    subject: 'Please, confirm your email',
    html: `<a target="_blank" href="${BASE_URL}/auth/verify/${user.verificationToken}">Click here to verify your email</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: 'Verification email sent',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }

  if (!user.verify) {
    throw HttpError(401, 'Email is not verified');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });
  await User.findByIdAndUpdate(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: '' });

  res.sendStatus(204);
};

const updateSubscription = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  const result = await User.findByIdAndUpdate(
    _id,
    { subscription },
    { new: true }
  );

  res.json({
    email: result.email,
    subscription: result.subscription,
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, filename } = req.file;

  const image = await jimp.read(tempUpload);
  image.resize(250, 250);
  await image.writeAsync(tempUpload);

  const avatarName = `${_id}_${filename}`;
  const resultUpload = path.join(avatarsDir, avatarName);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join('avatars', avatarName);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  login: ctrlWrapper(login),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
