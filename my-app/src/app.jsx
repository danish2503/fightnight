import React, { useState } from "react";
import emailjs from "@emailjs/browser";

/**
 * Windsor Ridge Fighting Chip — ticket reservation page
 * Single-file React component. Drop into any React app (Vite, CRA, Next "use client", etc).
 *
 * EMAIL SETUP (required for the confirmation email to actually send):
 * 1. npm install @emailjs/browser
 * 2. Create a free account at https://www.emailjs.com
 * 3. Add an Email Service (e.g. Gmail) — copy its Service ID.
 * 4. Create an Email Template with these variable placeholders in the body:
 *    {{to_email}} {{confirmation_code}} {{seat_section}} {{seat_row}} {{seat_number}}
 *    {{event_name}} {{event_date}} {{event_venue}}
 *    Set the template's "To Email" field to {{to_email}}. Copy the Template ID.
 * 5. Copy your Public Key from Account > General.
 * 6. Paste all three into EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / EMAILJS_PUBLIC_KEY below.
 *
 * Layout: a square ring sits in the top-left corner. Seating wraps the two
 * open sides of the ring — one block along the bottom, one along the right —
 * the way a corner section actually would in the armory.
 *
 * Seat selection: one seat per reservation. Picking a new seat swaps out
 * whichever seat was previously selected, so a visitor can never hold more than one.
 */

const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const EVENT = {
  name: "Windsor Ridge Fighting Chip",
  tagline: "The belt changes hands once a year. This is that night.",
  date: "Saturday, November 14",
  time: "Bell time 7:30 PM",
  venue: "The Windsor Ridge Armory",
  city: "Windsor Ridge, PA",
};

const FIGHT_CARD = [
  {
    slot: "Main Event",
    title: "Fighting Chip Championship",
    a: "Pranav \u201cGunna Cheese\u201d Ganesh",
    b: "Jaswanth \u201cWe Still Talking\u201d Velpula",
    note: "No disqualification",
  },
];

// side: "bottom" sections run horizontally under the ring.
// side: "right" sections run vertically beside the ring.
// Taken seat keys are "rowIndex-seatIndex" (both 0-based).
// 25 seats total in the house: 6 + 8 + 6 + 5.
const SECTIONS = [
  {
    id: "ringside",
    name: "Ringside",
    side: "bottom",
    rows: 1,
    seatsPerRow: 6,
    taken: [],
  },
  {
    id: "floor",
    name: "Floor",
    side: "bottom",
    rows: 2,
    seatsPerRow: 4,
    taken: [],
  },
  {
    id: "lower-bowl",
    name: "Lower Bowl",
    side: "right",
    rows: 2,
    seatsPerRow: 3,
    taken: [],
  },
  {
    id: "upper-bowl",
    name: "Upper Bowl",
    side: "right",
    rows: 1,
    seatsPerRow: 5,
    taken: [],
  },
];

const ROW_LETTERS = "ABCDEFGHIJ";

export default function WindsorRidgeFightingChip() {
  const [selectedSeat, setSelectedSeat] = useState(null); // { id, section, row, seat }
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const toggleSeat = (section, rowLetter, seatNumber, seatId) => {
    setSelectedSeat((current) =>
      current && current.id === seatId
        ? null
        : { id: seatId, section: section.name, row: rowLetter, seat: seatNumber }
    );
  };

  const handleReserve = async () => {
    if (!selectedSeat) return;
    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email so we can send your ticket.");
      return;
    }
    setEmailError("");
    setSendError("");
    setSending(true);

    const code = "WRFC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const trimmedEmail = email.trim();

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: trimmedEmail,
          confirmation_code: code,
          seat_section: selectedSeat.section,
          seat_row: selectedSeat.row,
          seat_number: selectedSeat.seat,
          event_name: EVENT.name,
          event_date: `${EVENT.date}, ${EVENT.time}`,
          event_venue: `${EVENT.venue}, ${EVENT.city}`,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setConfirmed({ code, seat: selectedSeat, email: trimmedEmail });
    } catch (err) {
      setSendError("Couldn't send the confirmation email. Try again.");
    } finally {
      setSending(false);
    }
  };

  const closeConfirm = () => {
    setConfirmed(null);
    setSelectedSeat(null);
    setEmail("");
    setEmailError("");
    setSendError("");
  };

  const renderSeatButton = (section, rowIdx, seatIdx, rowLetter) => {
    const key = `${rowIdx}-${seatIdx}`;
    const isTaken = section.taken.includes(key);
    const seatNumber = seatIdx + 1;
    const seatId = `${section.id}-${rowLetter}${seatNumber}`;
    const isSelected = selectedSeat && selectedSeat.id === seatId;
    return (
      <button
        key={seatIdx}
        className={"wrfc-seat" + (isTaken ? " taken" : "") + (isSelected ? " selected" : "")}
        disabled={isTaken}
        onClick={() => toggleSeat(section, rowLetter, seatNumber, seatId)}
        aria-label={`${section.name} row ${rowLetter} seat ${seatNumber}${isTaken ? ", taken" : ""}`}
        title={`${section.name} \u2014 Row ${rowLetter}, Seat ${seatNumber}`}
      />
    );
  };

  const renderBottomSection = (section) => {
    const available = section.rows * section.seatsPerRow - section.taken.length;
    return (
      <div className="wrfc-seat-section" key={section.id}>
        <div className="wrfc-seat-section-head">
          <span className="wrfc-seat-section-name display">{section.name}</span>
          <span className="wrfc-seat-section-count display">{available} available</span>
        </div>
        {Array.from({ length: section.rows }).map((_, rowIdx) => {
          const rowLetter = ROW_LETTERS[rowIdx];
          return (
            <div className="wrfc-seat-row" key={rowIdx}>
              <span className="wrfc-row-label display">{rowLetter}</span>
              <div className="wrfc-seat-row-seats">
                {Array.from({ length: section.seatsPerRow }).map((_, seatIdx) =>
                  renderSeatButton(section, rowIdx, seatIdx, rowLetter)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRightSection = (section) => {
    const available = section.rows * section.seatsPerRow - section.taken.length;
    return (
      <div className="wrfc-seat-section right" key={section.id}>
        <div className="wrfc-seat-section-head">
          <span className="wrfc-seat-section-name display">{section.name}</span>
          <span className="wrfc-seat-section-count display">{available} available</span>
        </div>
        <div className="wrfc-seat-cols">
          {Array.from({ length: section.rows }).map((_, rowIdx) => {
            const rowLetter = ROW_LETTERS[rowIdx];
            return (
              <div className="wrfc-seat-col" key={rowIdx}>
                <span className="wrfc-row-label display">{rowLetter}</span>
                <div className="wrfc-seat-col-seats">
                  {Array.from({ length: section.seatsPerRow }).map((_, seatIdx) =>
                    renderSeatButton(section, rowIdx, seatIdx, rowLetter)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const bottomSections = SECTIONS.filter((s) => s.side === "bottom");
  const rightSections = SECTIONS.filter((s) => s.side === "right");

  return (
    <div className="wrfc-root">
      <style>{`
        .wrfc-root {
          --ink: #efe7d6;
          --ink-dim: #b9ad96;
          --bg: #17130f;
          --panel: #1f1a14;
          --panel-2: #241d16;
          --taken: #332c24;
          --crimson: #c22030;
          --crimson-dim: #7a1620;
          --gold: #b8893a;
          --gold-bright: #d9a94f;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
          padding-bottom: 96px;
          position: relative;
        }
        .wrfc-root * { box-sizing: border-box; border: none; }
        .wrfc-root .display {
          font-family: 'Oswald', 'Arial Narrow', sans-serif;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        /* ---- Hero ---- */
        .wrfc-hero {
          padding: 56px 24px 40px;
          background:
            radial-gradient(ellipse 800px 400px at 15% 0%, rgba(194,32,48,0.16), transparent 60%),
            var(--bg);
          position: relative;
          overflow: hidden;
        }
        .wrfc-hero-inner { max-width: 880px; margin: 0 auto; }
        .wrfc-eyebrow {
          font-size: 13px;
          color: var(--gold-bright);
          font-family: 'Oswald', sans-serif;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .wrfc-eyebrow::before {
          content: "";
          width: 28px;
          height: 2px;
          background: var(--crimson);
          display: inline-block;
        }
        .wrfc-title {
          font-size: clamp(40px, 7vw, 76px);
          line-height: 0.96;
          text-transform: uppercase;
          margin: 0 0 18px;
          color: var(--ink);
        }
        .wrfc-title span { color: var(--crimson); }
        .wrfc-tagline {
          font-size: 17px;
          color: var(--ink-dim);
          max-width: 46ch;
          line-height: 1.5;
          margin: 0 0 28px;
        }
        .wrfc-meta { display: flex; flex-wrap: wrap; gap: 28px; font-size: 15px; }
        .wrfc-meta-item { display: flex; flex-direction: column; gap: 4px; }
        .wrfc-meta-label { font-size: 11px; color: var(--ink-dim); font-family: 'Oswald', sans-serif; }
        .wrfc-meta-value { color: var(--ink); font-weight: 500; }

        /* ---- Fight card ---- */
        .wrfc-section { max-width: 960px; margin: 0 auto; padding: 48px 24px; }
        .wrfc-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
        }
        .wrfc-section-title { font-size: 22px; text-transform: uppercase; color: var(--ink); }
        .wrfc-section-sub { font-size: 13px; color: var(--ink-dim); }

        .wrfc-bout {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 18px;
          padding: 24px;
          background: var(--panel);
        }
        .wrfc-bout-slot {
          font-family: 'Oswald', sans-serif;
          font-size: 12px;
          color: var(--gold-bright);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .wrfc-bout-title { font-size: 13px; color: var(--ink-dim); margin-bottom: 6px; }
        .wrfc-bout-names {
          font-size: 22px;
          color: var(--ink);
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .wrfc-vs { color: var(--crimson); font-size: 13px; font-family: 'Oswald', sans-serif; }
        .wrfc-bout-note { font-size: 12px; color: var(--ink-dim); margin-top: 6px; font-style: italic; }

        /* ---- Arena / seat map ---- */
        .wrfc-legend { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 24px; font-size: 12px; color: var(--ink-dim); }
        .wrfc-legend-item { display: flex; align-items: center; gap: 7px; }
        .wrfc-legend-swatch { width: 14px; height: 14px; display: inline-block; flex-shrink: 0; }
        .wrfc-legend-swatch.available { background: var(--panel-2); }
        .wrfc-legend-swatch.selected { background: var(--crimson); }
        .wrfc-legend-swatch.taken { background: var(--taken); }

        .wrfc-arena {
          display: grid;
          grid-template-columns: minmax(150px, 240px) 1fr;
          grid-template-rows: auto auto;
          gap: 28px;
        }
        .wrfc-ring {
          grid-column: 1;
          grid-row: 1;
          aspect-ratio: 1 / 1;
          background: var(--crimson);
          padding: 10px;
        }
        .wrfc-ring-mat {
          height: 100%;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wrfc-ring-mat span {
          font-family: 'Oswald', sans-serif;
          letter-spacing: 0.3em;
          color: var(--gold-bright);
          font-size: 13px;
          text-transform: uppercase;
        }

        .wrfc-right-zone {
          grid-column: 2;
          grid-row: 1;
          display: flex;
          gap: 32px;
          align-items: flex-start;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .wrfc-bottom-zone {
          grid-column: 1 / -1;
          grid-row: 2;
        }

        @media (max-width: 680px) {
          .wrfc-arena { grid-template-columns: 1fr; grid-template-rows: auto auto auto; }
          .wrfc-ring { grid-column: 1; grid-row: 1; max-width: 200px; }
          .wrfc-right-zone { grid-column: 1; grid-row: 2; }
          .wrfc-bottom-zone { grid-column: 1; grid-row: 3; }
        }

        .wrfc-seat-section { margin-bottom: 26px; }
        .wrfc-seat-section.right { margin-bottom: 0; }
        .wrfc-seat-section-head { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 12px; }
        .wrfc-seat-section-name { font-size: 15px; text-transform: uppercase; color: var(--ink); white-space: nowrap; }
        .wrfc-seat-section-count { font-size: 11px; color: var(--gold-bright); white-space: nowrap; }

        .wrfc-seat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .wrfc-row-label { width: 16px; font-size: 11px; color: var(--ink-dim); text-align: center; flex-shrink: 0; }
        .wrfc-seat-row-seats { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 4px; }

        .wrfc-seat-cols { display: flex; gap: 14px; }
        .wrfc-seat-col { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .wrfc-seat-col-seats { display: flex; flex-direction: column; gap: 5px; }

        .wrfc-seat {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          background: var(--panel-2);
          cursor: pointer;
          padding: 0;
        }
        .wrfc-seat:hover:not(:disabled) { background: var(--crimson-dim); }
        .wrfc-seat.selected { background: var(--crimson); }
        .wrfc-seat.taken { background: var(--taken); cursor: not-allowed; }

        /* ---- Order bar ---- */
        .wrfc-orderbar {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          background: var(--panel);
          padding: 16px 24px;
          z-index: 20;
        }
        .wrfc-orderbar-inner {
          max-width: 960px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .wrfc-order-info { min-width: 160px; }
        .wrfc-order-summary { font-size: 13px; color: var(--ink-dim); }
        .wrfc-order-total { font-family: 'Oswald', sans-serif; font-size: 20px; color: var(--gold-bright); }
        .wrfc-order-email { flex: 1; min-width: 200px; max-width: 280px; }
        .wrfc-email-input {
          width: 100%;
          background: var(--panel-2);
          color: var(--ink);
          padding: 12px 14px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
        }
        .wrfc-email-input::placeholder { color: var(--ink-dim); }
        .wrfc-email-error { color: var(--crimson); font-size: 12px; margin-top: 6px; }
        .wrfc-root button:focus-visible,
        .wrfc-root input:focus-visible {
          outline: 2px solid var(--gold-bright);
          outline-offset: 2px;
        }
        .wrfc-reserve-btn {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          background: var(--crimson);
          color: #fff;
          padding: 14px 32px;
          font-size: 15px;
          cursor: pointer;
          clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
        }
        .wrfc-reserve-btn:hover:not(:disabled) { background: #a11c2a; }
        .wrfc-reserve-btn:disabled { background: #5a5145; cursor: not-allowed; }

        /* ---- Confirmation ---- */
        .wrfc-overlay {
          position: fixed; inset: 0;
          background: rgba(10,8,6,0.78);
          display: flex; align-items: center; justify-content: center;
          z-index: 40;
          padding: 20px;
        }
        .wrfc-ticket { background: var(--panel); max-width: 420px; width: 100%; position: relative; }
        .wrfc-ticket-top { padding: 28px 26px 22px; }
        .wrfc-ticket-stub-label {
          font-family: 'Oswald', sans-serif;
          color: var(--gold-bright);
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .wrfc-ticket-code { font-family: 'Oswald', sans-serif; font-size: 26px; color: var(--ink); margin-bottom: 18px; }
        .wrfc-ticket-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--ink-dim); padding: 6px 0; }
        .wrfc-ticket-row span:last-child { color: var(--gold-bright); font-family: 'Oswald', sans-serif; text-transform: uppercase; }
        .wrfc-perforation { height: 2px; background: var(--panel-2); margin: 0 26px; position: relative; }
        .wrfc-perforation::before, .wrfc-perforation::after {
          content: "";
          position: absolute;
          top: -9px;
          width: 20px; height: 20px;
          background: rgba(10,8,6,0.78);
          border-radius: 50%;
        }
        .wrfc-perforation::before { left: -30px; }
        .wrfc-perforation::after { right: -30px; }
        .wrfc-ticket-bottom { padding: 22px 26px 26px; }
        .wrfc-ticket-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
        .wrfc-ticket-total-val { font-family: 'Oswald', sans-serif; font-size: 24px; color: var(--gold-bright); text-transform: uppercase; }
        .wrfc-close-btn {
          width: 100%;
          background: var(--panel-2);
          color: var(--ink);
          padding: 12px;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          cursor: pointer;
          font-size: 13px;
        }
        .wrfc-close-btn:hover { color: var(--gold-bright); }
      `}</style>

      {/* Hero */}
      <div className="wrfc-hero">
        <div className="wrfc-hero-inner">
          <div className="wrfc-eyebrow display">Fighting Chip &mdash; One Night Only</div>
          <h1 className="wrfc-title display">
            Windsor Ridge <span>Fighting Chip</span>
          </h1>
          <p className="wrfc-tagline">{EVENT.tagline}</p>
          <div className="wrfc-meta">
            <div className="wrfc-meta-item">
              <span className="wrfc-meta-label display">Date</span>
              <span className="wrfc-meta-value">{EVENT.date}</span>
            </div>
            <div className="wrfc-meta-item">
              <span className="wrfc-meta-label display">Bell Time</span>
              <span className="wrfc-meta-value">{EVENT.time}</span>
            </div>
            <div className="wrfc-meta-item">
              <span className="wrfc-meta-label display">Venue</span>
              <span className="wrfc-meta-value">{EVENT.venue}</span>
            </div>
            <div className="wrfc-meta-item">
              <span className="wrfc-meta-label display">City</span>
              <span className="wrfc-meta-value">{EVENT.city}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fight card */}
      <div className="wrfc-section">
        <div className="wrfc-section-head">
          <div className="wrfc-section-title display">The Main Event</div>
        </div>
        {FIGHT_CARD.map((bout, i) => (
          <div className="wrfc-bout" key={i}>
            <div className="wrfc-bout-slot display">{bout.slot}</div>
            <div>
              <div className="wrfc-bout-title">{bout.title}</div>
              <div className="wrfc-bout-names display">
                <span>{bout.a}</span>
                <span className="wrfc-vs">VS</span>
                <span>{bout.b}</span>
              </div>
              {bout.note && <div className="wrfc-bout-note">{bout.note}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Seat map */}
      <div className="wrfc-section">
        <div className="wrfc-section-head">
          <div className="wrfc-section-title display">Pick Your Seat</div>
          <div className="wrfc-section-sub">Free &middot; one seat per reservation</div>
        </div>

        <div className="wrfc-legend">
          <div className="wrfc-legend-item">
            <span className="wrfc-legend-swatch available" />
            Available
          </div>
          <div className="wrfc-legend-item">
            <span className="wrfc-legend-swatch selected" />
            Your seat
          </div>
          <div className="wrfc-legend-item">
            <span className="wrfc-legend-swatch taken" />
            Taken
          </div>
        </div>

        <div className="wrfc-arena">
          <div className="wrfc-ring">
            <div className="wrfc-ring-mat">
              <span className="display">Ring</span>
            </div>
          </div>

          <div className="wrfc-right-zone">
            {rightSections.map(renderRightSection)}
          </div>

          <div className="wrfc-bottom-zone">
            {bottomSections.map(renderBottomSection)}
          </div>
        </div>
      </div>

      {/* Order bar */}
      <div className="wrfc-orderbar">
        <div className="wrfc-orderbar-inner">
          <div className="wrfc-order-info">
            <div className="wrfc-order-summary">
              {selectedSeat
                ? `${selectedSeat.section} \u2014 Row ${selectedSeat.row}, Seat ${selectedSeat.seat}`
                : "No seat selected"}
            </div>
            <div className="wrfc-order-total display">Free</div>
          </div>
          <div className="wrfc-order-email">
            <input
              type="email"
              className="wrfc-email-input"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              aria-label="Email address for your ticket confirmation"
            />
            {emailError && <div className="wrfc-email-error">{emailError}</div>}
            {sendError && <div className="wrfc-email-error">{sendError}</div>}
          </div>
          <button
            className="wrfc-reserve-btn"
            disabled={!selectedSeat || sending}
            onClick={handleReserve}
          >
            {sending ? "Sending\u2026" : "Reserve seat"}
          </button>
        </div>
      </div>

      {/* Confirmation */}
      {confirmed && (
        <div className="wrfc-overlay" onClick={closeConfirm}>
          <div className="wrfc-ticket" onClick={(e) => e.stopPropagation()}>
            <div className="wrfc-ticket-top">
              <div className="wrfc-ticket-stub-label display">Reservation confirmed</div>
              <div className="wrfc-ticket-code display">{confirmed.code}</div>
              <div className="wrfc-ticket-row">
                <span>{confirmed.seat.section}</span>
                <span>
                  Row {confirmed.seat.row}, Seat {confirmed.seat.seat}
                </span>
              </div>
              <div className="wrfc-ticket-row">
                <span>Sent to</span>
                <span>{confirmed.email}</span>
              </div>
            </div>
            <div className="wrfc-perforation" />
            <div className="wrfc-ticket-bottom">
              <div className="wrfc-ticket-total">
                <span className="wrfc-ticket-stub-label display">Total charged</span>
                <span className="wrfc-ticket-total-val display">$0.00</span>
              </div>
              <button className="wrfc-close-btn" onClick={closeConfirm}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}