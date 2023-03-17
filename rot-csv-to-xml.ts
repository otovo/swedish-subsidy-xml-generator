#!/usr/bin/env node

import { parseString } from 'fast-csv';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import xmlFormat from 'xml-formatter';

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
    <?xml version="1.0" encoding="UTF-8"?>
    <ns1:Begaran xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:ns1="http://xmls.skatteverket.se/se/skatteverket/ht/begaran/6.0"
      xmlns:ns2="http://xmls.skatteverket.se/se/skatteverket/ht/komponent/begaran/6.0">
      <ns2:NamnPaBegaran>Otovo</ns2:NamnPaBegaran>
      <ns2:RotBegaran>
        ${arendenBuilder.build(data)}
      </ns2:RotBegaran>
    </ns1:Begaran>
  `;

  return xmlFormat(xml, { collapseContent: true });
};

export default async function (csvContent): Promise<string> {
  return new Promise((resolve, reject) => {
    const elems = [];
    parseString(csvContent, {
      headers: [
        'ns2:Kopare',
        'ns2:BetalningsDatum',
        'ns2:PrisForArbete',
        'ns2:BetaltBelopp',
        'ns2:BegartBelopp',
        'ns2:FakturaNr',
        'ns2:Ovrigkostnad',
        'ns2:Fastighetsbeteckning',
        'ns2:AntalTimmar',
        'ns2:Materialkostnad',
      ],
      renameHeaders: true,
    })
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
