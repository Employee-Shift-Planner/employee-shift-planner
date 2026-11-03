import { formatWeekRange, organizationTimeZone, toDateParam, toOrganizationDateTimeInput } from "./format";

const SCHEDULE_KEY = [
  "Key: a = AM; p = PM; 12a = midnight; 12p = noon; OFF = no shift scheduled.",
  "(+1d) = shift ends the next day. Example: 4p-12a (+1d) = 4:00 PM to midnight the next day.",
  "Shifts appear under their start day. All times use the timezone shown above.",
];

// Keep the same week boundaries as the schedule displayed in the planner.
export function scheduleGrid(weekStart, shifts, employees) {
  const dates = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + offset);
    return date;
  });
  const dateKeys = dates.map(toDateParam);
  const people = new Map(employees.map(employee => [employee.employeeId, { name: employee.fullName, shifts: [] }]));
  [...shifts].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).forEach(shift => {
    const start = toOrganizationDateTimeInput(shift.startTime);
    if (!dateKeys.includes(start.split("T")[0])) return;
    const key = shift.employeeId || shift.employeeName || "open-shift";
    if (!people.has(key)) people.set(key, { name: shift.employeeName || "Open shift", shifts: [] });
    people.get(key).shifts.push(shift);
  });
  const time = value => {
    const [hours, minutes] = value.split("T")[1].split(":").map(Number);
    return `${hours % 12 || 12}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}${hours < 12 ? "a" : "p"}`;
  };
  return {
    headers: ["NAMES", ...dates.map(date => `${date.getDate()}\n${date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}`)],
    rows: [...people.values()].map(person => [String(person.name || "Unnamed employee").toUpperCase(), ...dateKeys.map(day => {
      const daily = person.shifts.filter(shift => toOrganizationDateTimeInput(shift.startTime).split("T")[0] === day);
      return daily.length ? daily.map(shift => {
        const start = toOrganizationDateTimeInput(shift.startTime);
        const end = toOrganizationDateTimeInput(shift.endTime);
        return `${time(start)}-${time(end)}${end.split("T")[0] !== day ? " (+1d)" : ""}`;
      }).join("\n") : "OFF";
    })]),
  };
}

export async function downloadSchedule(format, weekStart, shifts, employees) {
  const { headers, rows } = scheduleGrid(weekStart, shifts, employees);
  const filename = `schedule-${toDateParam(weekStart)}`;
  const subtitle = `${formatWeekRange(weekStart)} | ${organizationTimeZone()}`;
  if (format === "pdf") {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const pdf = new jsPDF({ orientation: "landscape" });
    pdf.setFontSize(14);
    pdf.text("Weekly Schedule", 14, 18);
    pdf.setFontSize(10);
    pdf.text(subtitle, 14, 26);
    autoTable(pdf, {
      startY: 33, theme: "grid", head: [headers],
      body: rows.length ? rows : [[{ content: "No employees or shifts for this week.", colSpan: headers.length }]],
      styles: { fontSize: 10, textColor: 0, lineColor: 60, lineWidth: 0.25, halign: "center", valign: "middle", cellPadding: 2 },
      headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 48, halign: "left" } },
      margin: { top: 14, bottom: 32 },
      didParseCell: data => {
        if (data.section === "body" && data.cell.raw === "OFF") {
          data.cell.styles.fillColor = [210, 210, 210];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      const height = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      SCHEDULE_KEY.forEach((line, index) => pdf.text(line, 14, height - 24 + index * 4));
      pdf.text(`Page ${page} of ${pages}`, 14, height - 8);
    }
    pdf.save(`${filename}.pdf`);
    return;
  }
  if (format !== "excel") throw new Error("Choose PDF or Excel to download the schedule.");
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Weekly Schedule");
  sheet.addRow(["Weekly Schedule"]);
  sheet.mergeCells("A1:H1");
  sheet.addRow([subtitle]);
  sheet.mergeCells("A2:H2");
  sheet.addRow(headers);
  rows.forEach(row => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true, size: 14 };
  sheet.getRow(3).font = { bold: true };
  sheet.getRow(3).height = 32;
  sheet.columns.forEach((column, index) => { column.width = index === 0 ? 28 : 19; });
  for (let rowIndex = 3; rowIndex <= rows.length + 3; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    if (rowIndex > 3) row.height = Math.max(25, ...rows[rowIndex - 4].map(value => String(value).split("\n").length * 16));
    row.eachCell({ includeEmpty: true }, (cell, column) => {
      cell.alignment = { horizontal: column === 1 ? "left" : "center", vertical: "middle", wrapText: true };
      cell.border = Object.fromEntries(["top", "left", "bottom", "right"].map(side => [side, { style: "thin", color: { argb: "FF444444" } }]));
      if (cell.value === "OFF") {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD2D2D2" } };
        cell.font = { bold: true };
      }
    });
  }
  sheet.addRow([]);
  SCHEDULE_KEY.forEach(line => {
    const row = sheet.addRow([line]);
    sheet.mergeCells(row.number, 1, row.number, 8);
    row.height = 30;
    row.font = { size: 10 };
    row.alignment = { vertical: "middle", wrapText: true };
  });
  sheet.views = [{ state: "frozen", ySplit: 3, xSplit: 1 }];
  sheet.pageSetup = { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "1:3", printArea: `A1:H${sheet.rowCount}` };
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
