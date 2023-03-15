#!/usr/bin/env node

import fs from 'fs';
import csv from 'fast-csv';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let data = [];

const sourceFileName = process.argv[2];
const targetFileName = `${sourceFileName.split('.')[0]}-${new Date(Date.now()).toISOString()}.xml`;

if (!sourceFileName) {
  console.log('Please specify the name of the file to be parsed');
}

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
      <ns2:NamnPaBegaran>${targetFileName}</ns2:NamnPaBegaran>
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

const exportAsXml = (xml) => {
  fs.writeFile(
    path.resolve(__dirname, 'documents', targetFileName),
    xml,
    { flag: 'w' },
    function (err) {
      if (err) throw err;
      console.log(`${targetFileName} was generated from ${sourceFileName}`);
    }
  );
};

fs.createReadStream(path.resolve(__dirname, sourceFileName))
  .pipe(
    csv.parse({
      headers: (headers) => headers.map((header) => `ns2:${header}`),
    })
  )
  .on('error', (error) => console.error(error))
  .on('data', (row) => {
    const item = formatRow(row);
    data.push(item);
  })
  .on('end', () => {
    const xml = convertToXml(data);
    exportAsXml(xml);
  });
