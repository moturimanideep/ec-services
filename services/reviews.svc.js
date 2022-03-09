const reviewModel = require('../models/reviews.model');

class ReviewService {
    create(data) {
        return reviewModel.create(data);
    }
    byProductId(id) {
        return reviewModel.find({productId: id}, {__v: 0, _id: 0, userId: 0, productId: 0, createdAt: 0});
    }
    calAvgReview(id) {
        return reviewModel.aggregate([
            {$match: {productId: id, }},
            {$group: {_id: '$productId', average: {$avg: '$rating'}}}
        ]);
    }
    calCountByProductId(id) {
        return reviewModel.aggregate([
            {$match: {productId: id}},
            {$group: {_id: '$rating', count: {$sum: 1}}},
            {$project: {
                rating: '$_id',
                count: '$count',
                _id: 0
            }}
        ])
    }
}

module.exports = new ReviewService();