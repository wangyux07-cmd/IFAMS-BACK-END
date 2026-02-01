const toPlain = (doc) => {
  if (!doc) return null;
  // If it's a mongoose document, use toObject
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : Object.assign({}, doc);
  // Map _id -> id (string)
  if (obj._id) {
    obj.id = String(obj._id);
    delete obj._id;
  }
  if (obj.__v !== undefined) delete obj.__v;
  // Remove sensitive fields
  if (obj.password) delete obj.password;

  // Normalize common numeric fields
  if (obj.amount !== undefined) {
    const n = Number(obj.amount);
    obj.amount = Number.isFinite(n) ? n : obj.amount;
  }

  // Normalize date fields to YYYY-MM-DD when possible
  if (obj.date) {
    try {
      const d = new Date(obj.date);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        obj.date = `${yyyy}-${mm}-${dd}`;
      }
    } catch (e) {
      /* ignore */
    }
  }

  // Convert ObjectId refs to string ids
  if (obj.userId && typeof obj.userId === 'object' && obj.userId._id) {
    obj.userId = String(obj.userId._id);
  } else if (obj.userId) {
    obj.userId = String(obj.userId);
  }

  if (obj.sourceAssetId) obj.sourceAssetId = String(obj.sourceAssetId);

  return obj;
};

const format = (docOrDocs) => {
  if (!docOrDocs) return docOrDocs;
  if (Array.isArray(docOrDocs)) return docOrDocs.map(toPlain);
  return toPlain(docOrDocs);
};

module.exports = { format };
