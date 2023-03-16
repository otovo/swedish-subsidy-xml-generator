import gronToXml from '../../gront-stod-csv-to-xml';
import rotToXml from '../../rot-csv-to-xml';

export default async (req, res) => {
  const csvContent = req.body;
  const { type } = req.query;

  function getXml() {
    if (type === 'gron') {
      return gronToXml(csvContent);
    }
    return rotToXml(csvContent);
  }

  try {
    const xml = await getXml();
    res.status(200).send(xml);
  } catch (error) {
    console.log(error);
    return res.status(500).end();
  }
};
