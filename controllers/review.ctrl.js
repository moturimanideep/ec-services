const reviewService = require('../services/reviews.svc');
const productService = require('../services/product.svc');
const constants = require('../constants');

class ReviewController {    
    async insert(req, res) {
        try {
            const review = await reviewService.create(req.body);
            // const product = await productService.getById(req.body.productId);
            // if (product.reviewIds) {

            // } else {
            //     product.reviewIds = [];
            // }
            // product.reviewIds.push(review._id);
            // const updateProduct = await productService.add(product);
            // console.log(updateProduct);
            res.status(constants.STATUS_CODES.CREATED);
            res.send({status: 'Created successfully', review});
        } catch(error) {
            console.log(error);
            res.status(constants.STATUS_CODES.EXCEPTION)
            res.send({ error: 'server_error', errorDescription: error });
        }

    }
}

module.exports = new ReviewController();