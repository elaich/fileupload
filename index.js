const express = require('express');
const multer = require('multer');
const loki = require('lokijs');
const fileType = require('file-type');

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
  // checking extension
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
  fileSize: 1024 * 1024 * 2, //2MB
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
});

app.post('/profile', upload.single('image'), async (req, res) => {
  // checking filetype
  const {ext} = fileType(req.file.buffer);
  if (!ext.match(/\.(jpg|jpeg|png)$/)) {
    return res.sendStatus(400);
  }

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
