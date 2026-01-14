const Record = require('../models/Record');
const { withTransaction, withClient } = require('../utils/controllerWrapper');

class RecordController {
    create = withTransaction(async (req, res, client) => {
        const { type_record, score, date_record, id_utilisateur, id_exo } = req.body;
        const newRecord = await Record.create({ type_record, score, date_record, id_utilisateur, id_exo }, client);
        res.status(201).json({
            message: 'Record créé avec succès',
            record: newRecord
        });
    });

    update = withTransaction(async (req, res, client) => {
        const id_record = req.params.id;
        const { type_record, score, date_record, id_utilisateur, id_exo } = req.body;
        const updatedRecord = await Record.update(id_record, { type_record, score, date_record, id_utilisateur, id_exo }, client);
        res.status(200).json({
            message: 'Record mis à jour avec succès',
            record: updatedRecord
        });
    });

    delete = withTransaction(async (req, res, client) => {
        const id_record = req.params.id;
        const deletedRecord = await Record.delete(id_record, client);
        res.status(200).json({
            message: 'Record supprimé avec succès',
            record: deletedRecord
        });
    });

    getAllByUserId = withClient(async (req, res, client) => {
        const records = await Record.getAllByUserId(req.params.id_utilisateur, client);
        res.status(200).json(records);
    });
}

module.exports = RecordController;