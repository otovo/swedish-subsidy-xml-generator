#!/usr/bin/env node

import { parseString } from 'fast-csv';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const formatRow = (row) => {
  let utfortArbete = {};
  if (row['ns2:AntalTimmar']) {
    utfortArbete['ns2:AntalTimmar'] = row['ns2:AntalTimmar'];
    delete row['ns2:AntalTimmar'];
  }
  if (row['ns2:Materialkostnad']) {
    utfortArbete['ns2:Materialkostnad'] = row['ns2:Materialkostnad'];
    delete row['ns2:Materialkostnad'];
  }
  if (Object.keys(utfortArbete).length) {
    return {
      ...row,
      'ns2:UtfortArbete': {
        'ns2:GlasPlatarbete': utfortArbete,
      },
    };
  }
  return row;
};

const convertToXml = (data) => {
  const arendenBuilder = new XMLBuilder({
    arrayNodeName: 'ns2:Arenden',
    format: true,
    suppressEmptyNode: true,
  });
  const xml = `
    <ns1:Begaran xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:ns1="http://xmls.skatteverket.se/se/skatteverket/ht/begaran/6.0"
      xmlns:ns2="http://xmls.skatteverket.se/se/skatteverket/ht/komponent/begaran/6.0">
      <ns2:NamnPaBegaran>Otovo</ns2:NamnPaBegaran>
      <ns2:RotBegaran>
        ${arendenBuilder.build(data)}
      </ns2:RotBegaran>
    </ns1:Begaran>
  `;

  // Hack to format the xml by parsing the xml string, then building the xml again
  const parser = new XMLParser();
  const builder = new XMLBuilder({
    format: true,
    suppressEmptyNode: true,
  });
  return builder.build(parser.parse(xml));
};

export default async function (csvContent): Promise<string> {
  return new Promise((resolve, reject) => {
    const elems = [];
    parseString(csvContent, { headers: true })
      .on('error', (error) => reject(error))
      .on('data', (row) => {
        // @ts-ignore
        elems.push(formatRow(row));
      })
      .on('end', (rowCount: number) => {
        const xml = convertToXml(elems);
        resolve(xml);
      });
  });
}
