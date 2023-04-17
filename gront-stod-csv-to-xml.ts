#!/usr/bin/env node

import { parseString } from 'fast-csv';
import { XMLBuilder } from 'fast-xml-parser';
import xmlFormat from 'xml-formatter';

const headerKeys = [
  'p:FakturaNr',
  'p:Kopare',
  'p:Fastighetsbeteckning',
  'p:TypAvUtfortArbete',
  'p:AntalTimmar',
  'p:Kostnad',
  'p:OvrigKostnad',
  'p:Betalningsdatum',
  'p:BetaltBelopp',
  'p:BegartBelopp',
];

const formatRow = (row) => {
  return {
    [headerKeys[0]]: row[headerKeys[0]],
    [headerKeys[1]]: row[headerKeys[1]],
    'p:Fastighet': {
      [headerKeys[2]]: row[headerKeys[2]],
    },
    'p:UtfortArbete': {
      [headerKeys[3]]: row[headerKeys[3]],
      [headerKeys[4]]: row[headerKeys[4]],
      [headerKeys[5]]: row[headerKeys[5]],
    },
    [headerKeys[4]]: row[headerKeys[4]],
    [headerKeys[7]]: row[headerKeys[7]],
    [headerKeys[8]]: row[headerKeys[8]],
    [headerKeys[9]]: row[headerKeys[9]],
  }
};

const convertToXml = (data) => {
  const arendenBuilder = new XMLBuilder({
    arrayNodeName: 'p:Arende',
    format: true,
    suppressEmptyNode: true,
  });
  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <p:Begaran xmlns:p="http://xmls.skatteverket.se/se/skatteverket/skattered/begaran/1.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <p:NamnPaBegaran>GrönTeknik</p:NamnPaBegaran>
        <p:TypAvBegaran>GRON_TEKNIK</p:TypAvBegaran>
        <p:Utforare>5591266092</p:Utforare>
          ${arendenBuilder.build(data)}
    </p:Begaran>
  `;
  return xmlFormat(xml, { collapseContent: true });
};

export default async function (csvContent): Promise<string> {
  return new Promise((resolve, reject) => {
    const elems = [];
    parseString(csvContent, {
      headers: headerKeys,
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
