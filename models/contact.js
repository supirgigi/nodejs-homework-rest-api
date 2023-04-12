const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../utils');

const phoneRegexp = /^\(\d{3}\)\s\d{3}-\d{4}$/;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  { versionKey: false, timestamps: true }
);

contactSchema.post('save', handleMongooseError);

const addSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(phoneRegexp).required().messages({
    'string.pattern.base':
      '{{#label}} with value {:[.]} fails to match the required pattern: "(XXX) XXX-XXXX", where X is a digit',
  }),
  favorite: Joi.boolean(),
}).messages({
  'any.required': 'missing required {{#label}} field',
  'string.empty': '{{#label}} cannot be empty',
  'string.base': '{{#label}} must be a string',
});

const updateStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const schemas = {
  addSchema,
  updateStatusSchema,
};

const Contact = model('contact', contactSchema);

module.exports = { Contact, schemas };
