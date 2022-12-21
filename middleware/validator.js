const Joi = require('joi')
const { responseValidator } = require('../helper/response')

const validatorSQGrommingAndComplaint = (req, res, next) => {
  const schema = Joi.object().keys({
    data : Joi.array().items(Joi.object().keys({
      id: Joi.number().optional(),
      nik   : Joi.string().required(),
      name  : Joi.string().required(),
      kode_store  : Joi.string().required(),
      brand : Joi.string().required(),
      nilai : Joi.string().required(),      
    }))
  })
  const { error, value } = schema.validate(req?.body)
  responseValidator(req, res, next, error, value)
}

const validatorSQMShopper = (req, res, next) => {
  const schema = Joi.object().keys({
    data : Joi.array().items(Joi.object().keys({            
      id: Joi.number().optional(),
      kode_store  : Joi.string().required(),      
      nilai : Joi.string().required(),      
    }))
  })
  const { error, value } = schema.validate(req?.body)
  responseValidator(req, res, next, error, value)
}

const validatorSQRaportRank = (req, res, next) => {
  const schema = Joi.object().keys({
    period: Joi.string().required(),    
  })
  const { error, value } = schema.validate(req?.query)
  responseValidator(req, res, next, error, value)
}

const validatorSQRaport = (req, res, next) => {
  const schema = Joi.object().keys({
    period: Joi.string().required(),
    kode_store: Joi.string().optional(),
  })
  const { error, value } = schema.validate(req?.query)
  responseValidator(req, res, next, error, value)
}

const validatorSQRaportDetail = (req, res, next) => {
  const schema = Joi.object().keys({
    period: Joi.string().required(),
    kode_store: Joi.string().required(),
    nik: Joi.string().required()
  })
  const { error, value } = schema.validate(req?.query)
  responseValidator(req, res, next, error, value)
}

module.exports = {
  validatorSQRaportDetail,
  validatorSQRaportRank,
  validatorSQGrommingAndComplaint,
  validatorSQMShopper,
  validatorSQRaport
}