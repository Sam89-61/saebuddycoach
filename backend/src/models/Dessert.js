const BaseAliment = require('./BaseAliment');

class Dessert extends BaseAliment {
    static tableName = 'dessert';
    static primaryKey = 'id_dessert';
}

module.exports = Dessert;
