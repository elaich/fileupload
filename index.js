const express = require('express');
const multer = require('multer');
const loki = require('lokijs');

const db = new loki('loki.json', {persistenceMethode: 'fs'});

const app = express();

const loadCollection = function(colName, db) {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const _collection =
        db.getCollection(colName) || db.addCollection(colName);
      resolve(_collection);
    });
  });
};

const imageFilter = function(req, file, cb) {
  // accept image only
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(
      new Error('Only the following formats are allowed! (jpeg, jpg, png)'),
      false,
    );
  }
  cb(null, true);
};

const upload = multer({
  dest: 'images',
  fieldSize: '500000',
  fileFilter: imageFilter,
});

app.post('/profile', upload.single('image'), async (req, res) => {
  try {
    const col = await loadCollection('images', db);
    const data = col.insert(req.file);

    db.saveDatabase();
    res.send({
      id: data.$loki,
      fileName: data.filename,
      originalName: data.originalname,
    });
  } catch (err) {
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
