const BaseAliment = require('./BaseAliment');

class Plat extends BaseAliment {
    static tableName = 'plat';
    static primaryKey = 'id_plat';
}

module.exports = Plat;
