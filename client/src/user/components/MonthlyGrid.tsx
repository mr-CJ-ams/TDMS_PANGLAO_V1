/**
 * MonthlyGrid.tsx
 * 
 * Panglao Tourist Data Management System - Monthly Grid Component (Frontend)
 * 
 * =========================
 * Overview:
 * =========================
 * This React component renders a virtualized grid for displaying and interacting with daily room occupancy and guest metrics for a given month.
 * It is used in the monthly accommodation submission workflow, allowing users to view, select, and manage guest data for each room and day.
 * 
 * =========================
 * Responsibilities:
 * =========================
 * - Displays a scrollable, virtualized grid of days (rows) and rooms (columns), plus daily totals.
 * - Handles cell clicks to trigger guest entry or editing for a specific day and room.
 * - Shows color-coded room cells based on occupancy or custom logic.
 * - Calculates and displays daily totals for check-ins, overnight stays, and occupied rooms.
 * - Synchronizes vertical scrolling between the fixed day column and the main grid.
 * - Adapts grid size and layout responsively for desktop and mobile screens.
 * 
 * =========================
 * Key Features:
 * =========================
 * - Uses react-window's FixedSizeGrid for efficient rendering of large grids.
 * - Responsive design with dynamic sizing based on screen width and height.
 * - Customizable cell rendering for both header and data rows.
 * - Supports external refs for advanced parent component control.
 * - Modular logic for calculating totals and determining cell colors.
 * 
 * =========================
 * Typical Usage:
 * =========================
 * - Used in the monthly submission form to allow users to enter and review guest data for each day and room.
 * - Provides a visual overview of occupancy and guest metrics for the selected month.
 * 
 * =========================
 * Developer Notes:
 * =========================
 * - The parent component must provide functions for cell click handling, color logic, and daily totals calculation.
 * - Extend this component to support additional metrics, custom cell rendering, or advanced interactions as needed.
 * - Ensure performance by keeping props and state minimal and using memoization where appropriate.
 * 
 * =========================
 * Related Files:
 * =========================
 * - src/user/components/GuestModal.tsx         (handles guest entry/editing for selected cells)
 * - src/user/pages/SubmissionDetails.jsx       (displays and manages submission details)
 * - server/controllers/submissionsController.js (handles backend guest and stay logic)
 * 
 * =========================
 * Author: Carlojead Amaquin
 * Date: [2025-08-21]
 */

import React, { useMemo, useRef } from "react";
import { FixedSizeGrid as VirtualizedGrid } from "react-window";
import useMediaQuery from "../hooks/useMediaQuery";

interface MonthlyGridProps {
  daysInMonth: number;
  numberOfRooms: number;
  onCellClick: (day: number, room: number) => void;
  getRoomColor: (day: number, room: number) => string;
  calculateDailyTotals: (day: number) => { checkIns: number; overnight: number; occupied: number };
  disabled: boolean;
  gridRef?: React.RefObject<VirtualizedGrid>;
}

const CELL_WIDTH = 70;
const CELL_HEIGHT = 48;
const CELL_PADDING = 4;

const MonthlyGrid = ({
  daysInMonth,
  numberOfRooms,
  onCellClick,
  getRoomColor,
  calculateDailyTotals,
  disabled,
  gridRef
}: MonthlyGridProps) => {
  const rooms = useMemo(() => Array.from({ length: numberOfRooms }, (_, i) => i + 1), [numberOfRooms]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const isDesktop = useMediaQuery("(min-width:900px)");
  
  const mainGridRef = gridRef || useRef<VirtualizedGrid>(null);
  const daysColumnRef = useRef<VirtualizedGrid>(null);

  // Calculate grid sizes
  const totalColumns = numberOfRooms + 3; // rooms + 3 totals
  const fullGridWidth = totalColumns * CELL_WIDTH;
  const gridWidth = isDesktop
    ? Math.min(window.innerWidth - CELL_WIDTH, fullGridWidth)
    : window.innerWidth - CELL_WIDTH - 16;
  const gridHeight = isDesktop
    ? Math.min(window.innerHeight * 0.7, daysInMonth * CELL_HEIGHT + CELL_HEIGHT)
    : Math.min(window.innerHeight * 0.5, daysInMonth * CELL_HEIGHT + CELL_HEIGHT);

  // Track the last scroll position to prevent infinite updates
  const lastScrollTop = useRef<number>(0);
  // Sync vertical scrolling between days column and main grid
  // Sync vertical scrolling between days column and main grid
  const onMainGridScroll = ({ scrollTop }: { scrollTop: number }) => {
    if (daysColumnRef.current && Math.abs(scrollTop - lastScrollTop.current) > 1) {
      lastScrollTop.current = scrollTop;
      daysColumnRef.current.scrollTo({ scrollTop });
    }
  };

  const onDaysColumnScroll = ({ scrollTop }: { scrollTop: number }) => {
    if (mainGridRef.current && Math.abs(scrollTop - lastScrollTop.current) > 1) {
      lastScrollTop.current = scrollTop;
      mainGridRef.current.scrollTo({ scrollTop });
    }
  };

   // Also update the DayCell component to match the padding
  const DayCell = ({ rowIndex, style }: any) => {
    const paddedStyle = {
      ...style,
      padding: `${CELL_PADDING}px`, // Padding on all sides
      boxSizing: 'border-box'
    };

    if (rowIndex === 0) {
      return (
        <div style={{
          ...paddedStyle,
          background: "#e0e7ef",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "12px 0 0 0",
          borderBottom: "2px solid #bcd",
          borderRight: "1px solid #bcd",
          padding: `${CELL_PADDING}px` // Padding for header too
        }}>
          Day
        </div>
      );
    }
   return (
      <div style={{
        ...paddedStyle,
        background: "#fffaf0",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px 0 0 12px",
        borderBottom: "1px solid #eee",
        borderRight: "1px solid #eee",
      }}>
        {days[rowIndex - 1]}
      </div>
    );
  };

  // Render main grid cell (rooms + totals)
  const MainCell = ({ columnIndex, rowIndex, style }: any) => {
    const paddedStyle = {
      ...style,
      padding: `${CELL_PADDING}px`, // Padding on all sides
      boxSizing: 'border-box'
    };
    // Header row
    if (rowIndex === 0) {
      // Room headers
      if (columnIndex < numberOfRooms) {
        return (
          <div style={{
            ...paddedStyle,
            background: "#e0e7ef",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "2px solid #bcd",
            borderRight: "1px solid #bcd",
          }}>
            Room {rooms[columnIndex]}
          </div>
        );
      }
      // Totals headers
       const labels = ["Check-ins", "Overnight", "Occupied"];
      const i = columnIndex - numberOfRooms;
      return (
        <div style={{
          ...paddedStyle,
          background: "#e0e7ef",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "2px solid #bcd",
          borderRight: i === 2 ? undefined : "1px solid #bcd",
          borderRadius: i === 2 ? "0 12px 0 0" : undefined,
        }}>
          {labels[i]}
        </div>
      );
    }

    // Room cells
    if (columnIndex < numberOfRooms) {
      const room = rooms[columnIndex];
      const day = days[rowIndex - 1];
      return (
        <div style={paddedStyle}>
          <button
            onClick={() => !disabled && onCellClick(day, room)}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 px-2 py-1 border-0"
            style={{
              backgroundColor: getRoomColor(day, room),
              borderRadius: 8,
              fontSize: 14,
              color: "#333",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
              width: "100%",
              height: "100%",
              margin: 0,
            }}
            disabled={disabled}
          >
            Room {room}
          </button>
        </div>
      );
    }

 // Totals cells
    const totals = calculateDailyTotals(days[rowIndex - 1]);
    const labels = [totals.checkIns, totals.overnight, totals.occupied];
    const i = columnIndex - numberOfRooms;
    return (
      <div
        style={{
          ...paddedStyle,
          background: "#fffaf0",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: i === 2 ? "0 12px 12px 0" : undefined,
          borderBottom: "1px solid #eee",
          borderRight: i === 2 ? undefined : "1px solid #eee",
        }}
      >
        <strong>{labels[i]}</strong>
      </div>
    );
  };

  return (
    <div style={{ 
      display: "flex", 
      width: "100%",
      borderRadius: 12,
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      overflow: "hidden"
    }}>
      {/* Fixed day column */}
      <div style={{ 
        width: CELL_WIDTH,
        flexShrink: 0,
        borderRight: "1px solid #eee"
      }}>
        <VirtualizedGrid
          ref={daysColumnRef}
          columnCount={1}
          rowCount={daysInMonth + 1} // +1 for header
          columnWidth={CELL_WIDTH}
          rowHeight={CELL_HEIGHT}
          width={CELL_WIDTH}
          height={gridHeight}
          onScroll={onDaysColumnScroll}
          style={{ overflowX: "hidden" }}
        >
          {DayCell}
        </VirtualizedGrid>
      </div>

      {/* Scrollable main grid */}
      <div style={{ 
        flex: 1,
        overflow: "auto",
        minWidth: 0
      }}>
        <VirtualizedGrid
          ref={mainGridRef}
          columnCount={totalColumns}
          rowCount={daysInMonth + 1} // +1 for header
          columnWidth={CELL_WIDTH}
          rowHeight={CELL_HEIGHT}
          width={gridWidth}
          height={gridHeight}
          onScroll={onMainGridScroll}
        >
          {MainCell}
        </VirtualizedGrid>
      </div>
    </div>
  );
};

export default MonthlyGrid;