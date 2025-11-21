const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        image: Joi.string().allow("",null),
        categories: Joi.array().items(Joi.string().valid('Mountains', 'Beaches', 'Cities', 'Countryside', 'Amazing Pools', 'Castles', 'Camping', 'Farms', 'Arctic')).optional(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        description: Joi.string().required(),   
        country: Joi.string().required()
    }).required()
}); 
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required()
    }).required()
}); 

