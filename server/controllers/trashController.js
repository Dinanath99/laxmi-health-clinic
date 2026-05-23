const Trash = require('../models/Trash');
const mongoose = require('mongoose');

// Helper to push dynamically
exports.moveToTrash = async (collectionName, document, userId, documentName = 'Unknown') => {
  const trashEntry = new Trash({
    collectionName,
    originalId: document._id,
    documentName,
    data: document,
    deletedBy: userId
  });
  await trashEntry.save();
};

exports.getTrash = async (req, res) => {
  try {
    const trashItems = await Trash.find().sort({ deletedAt: -1 }).populate('deletedBy', 'name email');
    res.json(trashItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.restoreTrashItem = async (req, res) => {
  try {
    const { id } = req.params;
    const trashItem = await Trash.findById(id);
    if (!trashItem) return res.status(404).json({ error: 'Item not found in trash' });

    // Use mongoose.model to dynamically get the collection's model
    // e.g., if collectionName is "Transaction", mongoose.model("Transaction")
    let Model;
    try {
      Model = mongoose.model(trashItem.collectionName);
    } catch (e) {
      // Model might not be loaded in mongoose if not required directly here
      // But typically all models are loaded when starting the node app.
      return res.status(400).json({ error: `Model ${trashItem.collectionName} not registered.` });
    }

    // Insert back safely
    try {
      await Model.create(trashItem.data);
    } catch (createErr) {
      if (createErr.code === 11000) {
         // The document already exists in the original collection
         // This can happen if previous hard delete failed but trash was still saved
         console.log(`Restore Alert: Item ${trashItem.originalId} already exists in ${trashItem.collectionName}`);
      } else {
         throw createErr;
      }
    }
    
    // Clean up trash afterwards
    await Trash.findByIdAndDelete(id);

    res.json({ message: 'Item restored successfully (or was already present)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTrashItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Trash.findByIdAndDelete(id);
    res.json({ message: 'Item permanently deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.emptyTrash = async (req, res) => {
  try {
    await Trash.deleteMany({});
    res.json({ message: 'Trash emptied completely' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
