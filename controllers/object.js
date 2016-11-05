module.exports.index = (req, res) => {
  const collection = req.params.collection;
  const id = req.params.id;
  res.send('Object ' + collection + ' #' + id);
};
