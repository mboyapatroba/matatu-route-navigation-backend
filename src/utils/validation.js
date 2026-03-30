const Joi = require("joi");

// Auth-validation
const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

// Stops validation
const validateCreateStop = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    area: Joi.string().trim().optional().allow(""), // treat empty strings as valid instead of rejecting
  });
  return schema.validate(data, { abortEarly: false });
};

const updateStopValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    area: Joi.string().trim().optional().allow(""), // treat empty strings as valid instead of rejecting
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateCreateStop,
  updateStopValidation,
};
