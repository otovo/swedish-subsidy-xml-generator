#!/usr/bin/env node

import fs from 'fs';
import csv from 'fast-csv';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import process  from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let data = [];

const sourceFileName = process.argv[2];
const targetFileName = `${sourceFileName.split('.')[0]}-${new Date(Date.now()).toISOString()}.xml`;

if (!sourceFileName) {
  console.log('Please specify the name of the file to be parsed');
}

const formatRow = (row) => {
  if (row['p:Fastighetsbeteckning']) {
    row = {
      ...row,
      'p:Fastighet': {
        'p:Fastighetsbeteckning': row['p:Fastighetsbeteckning'],
      },
    };
    delete row['p:Fastighetsbeteckning'];
  }

  let utfortArbete = {};
  if (row['p:TypAvUtfortArbete']) {
    utfortArbete = {
      'p:TypAvUtfortArbete': row['p:TypAvUtfortArbete'],
    };
    delete row['p:TypAvUtfortArbete'];
  }
  if (row['p:AntalTimmar']) {
    utfortArbete = {
      ...utfortArbete,
      'p:AntalTimmar': row['p:AntalTimmar'],
    };
    delete row['p:AntalTimmar'];
  }
  if (row['p:Kostnad']) {
    utfortArbete = {
      ...utfortArbete,
      'p:Kostnad': row['p:Kostnad'],
    };
    delete row['p:Kostnad'];
  }

  if (Object.keys(utfortArbete).length) {
    return {
      ...row,
      'p:UtfortArbete': {
        'p:GlasPlatarbete': utfortArbete,
      },
    };
  }
  return row;
};

const convertToXml = (data) => {
  const arendenBuilder = new XMLBuilder({
    arrayNodeName: 'p:Arende',
    format: true,
    suppressEmptyNode: true,
  });
  const xml = `
    <p:Begaran xmlns:p="http://xmls.skatteverket.se/se/skatteverket/skattered/begaran/1.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <p:NamnPaBegaran>GrönTeknik</p:NamnPaBegaran>
        <p:TypAvBegaran>GRON_TEKNIK</p:TypAvBegaran>
        <p:Utforare>####</p:Utforare>
        <p:RotBegaran>
            ${arendenBuilder.build(data)}
        </p:RotBegaran>
    </p:Begaran>
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
      console.log(`Exported as ${targetFileName}`);
    }
  );
};

fs.createReadStream(path.resolve(__dirname, sourceFileName))
  .pipe(
    csv.parse({
      headers: (headers) => headers.map((header) => `p:${header}`),
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
