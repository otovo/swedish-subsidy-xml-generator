import csvToXml from '../../gront-stod-csv-to-xml';

export default async (req, res) => {
  const csvContent = req.body;

  try {
    const xml = await csvToXml(csvContent);
    res.status(200).send(xml);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
};
