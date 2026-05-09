// Manifest CSV exporter — flat row-per-card, same fields as manifest-json.
//
// This is the format downstream spreadsheet / Component Studio tooling tends
// to ingest most easily. Columns are stable and alphabetised after the id.

export const manifestCsvExporter = {
  id: 'manifest-csv',
  label: 'Manifest (CSV)',
  multiFile: false,
  run(deck, selection /*, opts */) {
    const cols = [
      'id', 'profile', 'energy', 'value', 'wild', 'wildIndex',
      'selectedConnector', 'selectedLayout', 'selectedEnergyArt',
      'selectedFrame', 'selectedTypography', 'selectedWild',
      'outputFilename'
    ];
    const rows = [cols.join(',')];
    for (const c of deck) {
      const row = [
        c.id, c.profile, c.energy, c.value ?? '', c.wild, c.wildIndex ?? '',
        selection.connector, selection.layout, selection.energyArt,
        selection.frame, selection.typography, selection.wild,
        `cards/${c.id}.svg`
      ].map(csvCell).join(',');
      rows.push(row);
    }
    return {
      files: [{
        name: 'manifest.csv',
        mime: 'text/csv',
        content: rows.join('\n') + '\n'
      }],
      primary: 'manifest.csv'
    };
  }
};

function csvCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
