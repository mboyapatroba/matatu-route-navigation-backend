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

// Create Route Validation
const validateCreateRoute = (data) => {
  const schema = Joi.object({
    routeNumber: Joi.string().trim().min(1).max(50).required(),
    startStop: Joi.string().required(),
    endStop: Joi.string().required(),
    stops: Joi.array().items(Joi.string()).min(2).required(),
    distanceKm: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

//update Route validation
const validateUpdateRoute = (data) => {
  const schema = Joi.object({
    routeNumber: Joi.string().trim().min(1).max(50).optional(),
    startStop: Joi.string().optional(),
    endStop: Joi.string().optional(),
    stops: Joi.array().items(Joi.string()).min(2).optional(),
    distanceKm: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
  });
};
module.exports = {
  validateRegistration,
  validateLogin,
  validateCreateStop,
  updateStopValidation,
  validateCreateRoute,
  validateUpdateRoute,
};
