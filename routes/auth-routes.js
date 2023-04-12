const express = require('express');

const ctrl = require('../controllers/auth-controllers');
const { validateBody } = require('../utils');
const { schemas } = require('../models/user');
const { authenticate } = require('../middlewares');

const router = express.Router();

router.post('/register', validateBody(schemas.registerSchema), ctrl.register);

router.post('/login', validateBody(schemas.loginSchema), ctrl.login);

router.get('/current', authenticate, ctrl.getCurrentUser);

router.post('/logout', authenticate, ctrl.logout);

router.patch(
  '/',
  authenticate,
  validateBody(schemas.subscriptionUpdateSchema),
  ctrl.updateSubscription
);

module.exports = router;
