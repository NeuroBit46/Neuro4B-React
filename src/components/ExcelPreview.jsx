import Papa from 'papaparse';
import { useEffect, useState } from 'react';

export default function ExcelPreview({ file, onLoadEnd }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        if (typeof file === 'string') {
          // archivo desde public (URL)
          const response = await fetch(file);
          const text = await response.text();
          const result = Papa.parse(text, { header: false });
          setRows(result.data);
        } else if (file instanceof File) {
          // archivo desde API o input
          const reader = new FileReader();
          reader.onload = e => {
            const result = Papa.parse(e.target.result, { header: false });
            setRows(result.data);
          };
          reader.readAsText(file);
        }
      } catch (err) {
        console.error('Error cargando CSV', err);
      } finally {
        if (onLoadEnd) onLoadEnd();
      }
    };

    loadCSV();
    // eslint-disable-next-line
  }, [file, onLoadEnd]);

  const headers = rows.length > 0 ? rows[0] : [];


  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-primary text-primary-bg shadow-md">
          <tr>
            {headers.map((col, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i} className="bg-secondary-bg hover:bg-tertiary-bg rounded transition-colors durantion-200">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
