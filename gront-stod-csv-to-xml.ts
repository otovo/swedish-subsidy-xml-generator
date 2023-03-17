#!/usr/bin/env node

import { parseString } from 'fast-csv';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import xmlFormat from 'xml-formatter';

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
        <p:Utforare>5591266092</p:Utforare>
        <p:RotBegaran>
            ${arendenBuilder.build(data)}
        </p:RotBegaran>
    </p:Begaran>
  `;
  return xmlFormat(xml);
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
