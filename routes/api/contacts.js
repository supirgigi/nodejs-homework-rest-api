const express = require('express');

const ctrl = require('../../controllers/contacts');
const { validateBody } = require('../../utils');
const { schemas } = require('../../models/contact');

const router = express.Router();

router.get('/', ctrl.getContacts);

router.get('/:id', ctrl.getContactById);

router.post('/', validateBody(schemas.addSchema), ctrl.addContact);

router.delete('/:id', ctrl.deleteContact);

router.put('/:id', validateBody(schemas.addSchema), ctrl.updateContact);

router.patch(
  '/:id/favorite',
  validateBody(schemas.updateStatusSchema),
  ctrl.updateStatusContact
);

module.exports = router;
