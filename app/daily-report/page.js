"use client";

import { useEffect, useMemo, useState } from "react";
import { getBackendUrl } from "../config/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, startOfDay, endOfDay } from "date-fns";

function diffHM(startISO, endISO) {
  const s = new Date(startISO);
  const e = new Date(endISO ?? Date.now());
  const ms = Math.max(0, e - s);
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// Sample rows if the API returns nothing (so the page is demonstrable)
function sampleRowsFor(dateStr) {
  const d = new Date(dateStr);
  const at = (h, m) =>
    format(new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m), "dd/MM/yyyy, HH:mm");

  return [
    {
      no: 1,
      id: 1,
      reportedTime: at(9, 15),
      location: "Library - 2nd Floor",
      problem: "Broken air conditioner — not cooling.",
      requester: "u6440041",
      supervisor: "Gunter",
      status: "Completed",
      completedAt: at(11, 45),
      duration: diffHM(
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 15).toISOString(),
        new Date(d.getFullYear(), d.getMonth(), d.getDate(), 11, 45).toISOString()
      ),
      category: "Facilities",
    },
    {
      no: 2,
      id: 2,
      reportedTime: at(10, 20),
      location: "Cafeteria",
      problem: "Water leakage under sink.",
      requester: "u6400002",
      supervisor: "John Pork",
      status: "Pending",
      completedAt: "",
      duration: "-",
      category: "Plumbing",
    },
  ];
}

export default function DailyReportsPage() {
  const backendUrl = getBackendUrl();
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        setError("");

        const from = startOfDay(new Date(date)).toISOString();
        const to = endOfDay(new Date(date)).toISOString();

        const res = await fetch(
          `${backendUrl}/issues/reports?from=${encodeURIComponent(
            from
          )}&to=${encodeURIComponent(to)}&page=0&size=1000`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        let mapped = (Array.isArray(data) ? data : []).map((r, i) => ({
          no: i + 1,
          id: r.id ?? i + 1, // numeric ID
          reportedTime: r.createdAt
            ? format(new Date(r.createdAt), "dd/MM/yyyy, HH:mm")
            : "-",
          location: r.customLocation || r.location || "-",
          problem: r.description || "-",
          requester: r.reportedBy?.username || "-",
          supervisor: r.assignedTo?.name || "-",
          status: r.status || "-",
          completedAt: r.updatedAt
            ? format(new Date(r.updatedAt), "dd/MM/yyyy, HH:mm")
            : "",
          duration: r.updatedAt ? diffHM(r.createdAt, r.updatedAt) : "-",
          category: r.category || "-",
        }));

        if (mapped.length === 0) {
          mapped = sampleRowsFor(date);
        }

        setRows(mapped);
      } catch (e) {
        console.error(e);
        setError("Failed to load daily reports. Showing sample data.");
        setRows(sampleRowsFor(date));
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
  }, [date]);

  // NOTE: Priority removed
  const columns = useMemo(
    () => [
      { key: "no", label: "#" },
      { key: "id", label: "ID" },
      { key: "reportedTime", label: "Reported Time" },
      { key: "location", label: "Location" },
      { key: "problem", label: "Issue / Problem" },
      { key: "requester", label: "Requester" },
      { key: "supervisor", label: "Supervisor" },
      { key: "status", label: "Result / Status" },
      { key: "category", label: "Category" },
      { key: "completedAt", label: "Completed Time" },
      { key: "duration", label: "Duration" },
    ],
    []
  );

  const handlePrint = () => window.print();

  const handlePdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Daily Reports", margin, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${format(new Date(date), "dd/MM/yyyy")}`, margin, 60);

    // Column widths that fit into A4-landscape printable width
    // Sum ≈ contentWidth (around 762pt)
    const columnStyles = {
      0: { cellWidth: 24 },  // #
      1: { cellWidth: 40 },  // ID
      2: { cellWidth: 90 },  // Reported Time
      3: { cellWidth: 90 },  // Location
      4: { cellWidth: 130 }, // Problem
      5: { cellWidth: 60 },  // Requester
      6: { cellWidth: 60 },  // Supervisor
      7: { cellWidth: 60 },  // Status
      8: { cellWidth: 60 },  // Category
      9: { cellWidth: 85 },  // Completed Time
      10: { cellWidth: 55 }, // Duration
    };

    autoTable(doc, {
      startY: 80,
      head: [columns.map((c) => c.label)],
      body: rows.map((r) => columns.map((c) => r[c.key] ?? "")),
      styles: {
        fontSize: 8,        // smaller so everything fits
        cellPadding: 4,
        overflow: "linebreak",
      },
      headStyles: { fillColor: [245, 245, 245], textColor: 20 },
      columnStyles,
      tableWidth: contentWidth,    // stay inside margins
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        // Footer page number
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth - margin - 80,
          doc.internal.pageSize.getHeight() - 16
        );
      },
    });

    doc.save(`Daily_Reports_${date}.pdf`);
  };

  return (
    <div className="flex-1 p-6 print:p-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold">Daily Reports</h1>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={handlePrint}
            className="rounded bg-gray-700 text-white px-4 py-2 text-sm"
          >
            Print
          </button>
          <button
            onClick={handlePdf}
            className="rounded bg-blue-600 text-white px-4 py-2 text-sm"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading daily reports...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md p-4 overflow-x-auto">
          {rows.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg">No reports found for {format(new Date(date), "dd/MM/yyyy")}.</p>
              <p className="text-gray-400 text-sm mt-1">Try selecting a different date.</p>
            </div>
          ) : (
          <table className="w-full table-auto border-collapse text-[13px]">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((c) => (
                  <th key={c.key} className="p-2 text-left font-semibold border">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                  {columns.map((c) => (
                    <td key={c.key} className="p-2 border align-top">
                      {r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {/* Print tweaks so the table fills the page cleanly */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 16mm;
          }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
