const express = require('express');

const ctrl = require('../../controllers/contacts-controllers');
const { validateBody } = require('../../utils');
const { schemas } = require('../../models/contact');
const { isValidId, authenticate } = require('../../middlewares');

const router = express.Router();

router.get('/', authenticate, ctrl.getContacts);

router.get('/:id', authenticate, isValidId, ctrl.getContactById);

router.post(
  '/',
  authenticate,
  validateBody(schemas.addSchema),
  ctrl.addContact
);

router.delete('/:id', authenticate, isValidId, ctrl.deleteContact);

router.put(
  '/:id',
  authenticate,
  isValidId,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  '/:id/favorite',
  authenticate,
  isValidId,
  validateBody(schemas.updateStatusSchema),
  ctrl.updateContactStatus
);

module.exports = router;
