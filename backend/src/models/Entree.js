const BaseAliment = require('./BaseAliment');

class Entree extends BaseAliment {
    static tableName = 'entree';
    static primaryKey = 'id_entree';
}

module.exports = Entree;