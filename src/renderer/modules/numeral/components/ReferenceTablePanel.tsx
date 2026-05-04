import React from 'react'
import { uk } from '../../../i18n/uk'

const TABLE_DATA = [
  { dec: 0, bin: '0000', hex: '0' },
  { dec: 1, bin: '0001', hex: '1' },
  { dec: 2, bin: '0010', hex: '2' },
  { dec: 3, bin: '0011', hex: '3' },
  { dec: 4, bin: '0100', hex: '4' },
  { dec: 5, bin: '0101', hex: '5' },
  { dec: 6, bin: '0110', hex: '6' },
  { dec: 7, bin: '0111', hex: '7' },
  { dec: 8, bin: '1000', hex: '8' },
  { dec: 9, bin: '1001', hex: '9' },
  { dec: 10, bin: '1010', hex: 'A' },
  { dec: 11, bin: '1011', hex: 'B' },
  { dec: 12, bin: '1100', hex: 'C' },
  { dec: 13, bin: '1101', hex: 'D' },
  { dec: 14, bin: '1110', hex: 'E' },
  { dec: 15, bin: '1111', hex: 'F' },
  { dec: 255, bin: '1111 1111', hex: 'FF' },
  { dec: 65535, bin: '1111 1111 1111 1111', hex: 'FFFF' },
  { dec: 4294967295, bin: '1111…1111 (32 біти)', hex: 'FFFF FFFF' },
]

export default function ReferenceTablePanel() {
  return (
    <div>
      <h3 className="section-title">{uk.numeral.referenceTable}</h3>
      <table className="table-base text-xs w-full">
        <thead>
          <tr>
            <th>{uk.numeral.decShort}</th>
            <th>{uk.numeral.binShort}</th>
            <th>{uk.numeral.hexShort}</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_DATA.map((row) => (
            <tr key={row.dec}>
              <td className="font-mono">{row.dec}</td>
              <td className="font-mono">{row.bin}</td>
              <td className="font-mono font-bold">{row.hex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
