const mongoose = require('mongoose');

module.exports = exports = function trashPlugin(schema, options) {
  schema.pre('findOneAndDelete', async function() {
    if (this.model.modelName === 'Trash') return;
    try {
      const docToTrash = await this.model.findOne(this.getQuery());
      if (docToTrash) {
        const Trash = require('./Trash');
        await Trash.create({
          collectionName: this.model.modelName,
          originalId: docToTrash._id,
          documentName: docToTrash.name || docToTrash.pharmacyName || docToTrash.ledgerName || docToTrash.particulars || docToTrash.description || this.model.modelName + ' Entry',
          data: docToTrash.toObject(),
        });
      }
    } catch (err) {
      console.error('Trash Plugin findOneAndDelete Error:', err);
    }
  });

  schema.pre('deleteMany', async function() {
    if (this.model.modelName === 'Trash') return;
    try {
      const docsToTrash = await this.model.find(this.getQuery());
      if (docsToTrash && docsToTrash.length > 0) {
        const Trash = require('./Trash');
        const payloads = docsToTrash.map(doc => ({
           collectionName: this.model.modelName,
           originalId: doc._id,
           documentName: doc.name || doc.pharmacyName || doc.ledgerName || doc.particulars || doc.description || 'Deleted ' + this.model.modelName,
           data: doc.toObject()
        }));
        await Trash.insertMany(payloads);
      }
    } catch (err) {
      console.error('Trash Plugin deleteMany Error:', err);
    }
  });
};
