
export interface CSVMetric {
  name: string;
  type?: string;
  addGapAfter?: boolean;
}

interface DownloadCSVOptions {
  metrics: CSVMetric[];
  sheetData: any;
  displayedQuarters: { label: string; key: string }[];
  sheetType: string;
  viewMode: "quarter" | "year";
  selectedYear: string;
}

export const downloadCSV = ({
  metrics,
  sheetData,
  displayedQuarters,
  sheetType,
  viewMode,
  selectedYear,
}: DownloadCSVOptions) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Header
  csvContent += ["Metrics", ...displayedQuarters.map((q) => q.label)].join(",") + "\n";

  // Data rows
  metrics.forEach((metric) => {
    const row = [metric.name];
    displayedQuarters.forEach((q) => {
      const val = sheetData?.[metric.name]?.[q.key]?.value ?? 0;
      row.push(val);
    });
    csvContent += row.join(",") + "\n";
    if (metric.addGapAfter) csvContent += "\n";
  });

  // Download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `${sheetType}_${viewMode}_${selectedYear.replace(" ", "_")}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
