import React, { useState, useMemo } from "react";

/**
 * Windsor Ridge Fighting Chip — ticket reservation page
 * Single-file React component. Drop into any React app (Vite, CRA, Next "use client", etc).
 * No external UI libraries required — styles are scoped and injected via a <style> tag.
 */

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
    a: "Marcus \u201cSteel\u201d Vance (C)",
    b: "Dez \u201cIron\u201d Okafor",
    note: "No disqualification",
  },
  {
    slot: "Co-Main",
    title: "Ridge Cup Ladder Match",
    a: "The Coldwater Brothers",
    b: "Rio & Suarez",
    note: "First team to the top wins",
  },
  {
    slot: "Undercard",
    title: "Singles Match",
    a: "Nikita Volkova",
    b: "\u201cPromise\u201d Jade Hale",
    note: "",
  },
  {
    slot: "Opener",
    title: "Singles Match",
    a: "Big Sal Dorio",
    b: "Tommy Ninefingers",
    note: "",
  },
];

const TICKET_TIERS = [
  {
    id: "ringside",
    name: "Ringside",
    price: 145,
    blurb: "Front three rows. Close enough to hear the ring ropes creak.",
    left: 12,
  },
  {
    id: "floor",
    name: "Floor",
    price: 95,
    blurb: "General floor seating, unobstructed view of the ring.",
    left: 48,
  },
  {
    id: "lower-bowl",
    name: "Lower Bowl",
    price: 65,
    blurb: "Reserved seating, sections 100\u2013115.",
    left: 130,
  },
  {
    id: "upper-bowl",
    name: "Upper Bowl",
    price: 35,
    blurb: "General admission, upper deck. Still hear every chair shot.",
    left: 300,
  },
];

const FEE_RATE = 0.12;
const MAX_PER_TIER = 8;

export default function WindsorRidgeFightingChip() {
  const [quantities, setQuantities] = useState({});
  const [confirmed, setConfirmed] = useState(null);

  const setQty = (id, next, max) => {
    const clamped = Math.max(0, Math.min(max, next));
    setQuantities((q) => ({ ...q, [id]: clamped }));
  };

  const lineItems = useMemo(
    () =>
      TICKET_TIERS.map((t) => ({
        ...t,
        qty: quantities[t.id] || 0,
        subtotal: (quantities[t.id] || 0) * t.price,
      })).filter((t) => t.qty > 0),
    [quantities]
  );

  const subtotal = lineItems.reduce((s, t) => s + t.subtotal, 0);
  const fees = Math.round(subtotal * FEE_RATE * 100) / 100;
  const total = subtotal + fees;
  const totalQty = lineItems.reduce((s, t) => s + t.qty, 0);

  const handleReserve = () => {
    if (totalQty === 0) return;
    setConfirmed({
      code: "WRFC-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      items: lineItems,
      total,
    });
  };

  const closeConfirm = () => {
    setConfirmed(null);
    setQuantities({});
  };

  return (
    <div className="wrfc-root">
      <style>{`
        .wrfc-root {
          --ink: #efe7d6;
          --ink-dim: #b9ad96;
          --bg: #17130f;
          --panel: #1f1a14;
          --panel-2: #241d16;
          --line: #4a4034;
          --crimson: #c22030;
          --crimson-dim: #7a1620;
          --gold: #b8893a;
          --gold-bright: #d9a94f;
          --radius: 2px;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          min-height: 100vh;
          padding-bottom: 96px;
          position: relative;
        }
        .wrfc-root * { box-sizing: border-box; }
        .wrfc-root .display {
          font-family: 'Oswald', 'Arial Narrow', sans-serif;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        /* ---- Hero ---- */
        .wrfc-hero {
          border-bottom: 1px solid var(--line);
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
        .wrfc-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 28px;
          font-size: 15px;
        }
        .wrfc-meta-item { display: flex; flex-direction: column; gap: 4px; }
        .wrfc-meta-label {
          font-size: 11px;
          color: var(--ink-dim);
          font-family: 'Oswald', sans-serif;
        }
        .wrfc-meta-value { color: var(--ink); font-weight: 500; }

        /* ---- Fight card ---- */
        .wrfc-section { max-width: 880px; margin: 0 auto; padding: 48px 24px; }
        .wrfc-section-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--line);
          padding-bottom: 12px;
        }
        .wrfc-section-title {
          font-size: 22px;
          text-transform: uppercase;
          color: var(--ink);
        }
        .wrfc-section-sub { font-size: 13px; color: var(--ink-dim); }

        .wrfc-bout {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: 18px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(74,64,52,0.5);
        }
        .wrfc-bout:last-child { border-bottom: none; }
        .wrfc-bout-slot {
          font-family: 'Oswald', sans-serif;
          font-size: 12px;
          color: var(--gold-bright);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .wrfc-bout-title { font-size: 13px; color: var(--ink-dim); margin-bottom: 6px; }
        .wrfc-bout-names {
          font-size: 19px;
          color: var(--ink);
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .wrfc-vs { color: var(--crimson); font-size: 13px; font-family: 'Oswald', sans-serif; }
        .wrfc-bout-note { font-size: 12px; color: var(--ink-dim); margin-top: 6px; font-style: italic; }

        /* ---- Ticket tiers ---- */
        .wrfc-tier {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 16px;
          align-items: center;
          background: var(--panel);
          border: 1px solid var(--line);
          padding: 20px;
          margin-bottom: 12px;
          position: relative;
        }
        .wrfc-tier::before {
          content: "";
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: var(--crimson);
        }
        .wrfc-tier-name {
          font-size: 19px;
          text-transform: uppercase;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .wrfc-tier-blurb { font-size: 13px; color: var(--ink-dim); max-width: 42ch; line-height: 1.4; }
        .wrfc-tier-left { font-size: 12px; color: var(--gold-bright); margin-top: 8px; }
        .wrfc-tier-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        .wrfc-tier-price { font-family: 'Oswald', sans-serif; font-size: 22px; color: var(--ink); }
        .wrfc-tier-price small { font-size: 12px; color: var(--ink-dim); font-family: 'Inter', sans-serif; }

        .wrfc-stepper {
          display: flex;
          align-items: center;
          border: 1px solid var(--line);
        }
        .wrfc-stepper button {
          width: 34px;
          height: 34px;
          background: var(--panel-2);
          border: none;
          color: var(--ink);
          font-size: 16px;
          cursor: pointer;
          font-family: 'Oswald', sans-serif;
        }
        .wrfc-stepper button:hover:not(:disabled) { background: var(--crimson-dim); }
        .wrfc-stepper button:disabled { color: var(--line); cursor: not-allowed; }
        .wrfc-stepper-val {
          width: 34px;
          text-align: center;
          font-size: 15px;
          font-family: 'Oswald', sans-serif;
        }

        @media (max-width: 560px) {
          .wrfc-tier { grid-template-columns: 1fr; }
          .wrfc-tier-right { align-items: flex-start; }
        }

        /* ---- Order bar ---- */
        .wrfc-orderbar {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          background: var(--panel);
          border-top: 1px solid var(--line);
          padding: 16px 24px;
          z-index: 20;
        }
        .wrfc-orderbar-inner {
          max-width: 880px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .wrfc-order-summary { font-size: 13px; color: var(--ink-dim); }
        .wrfc-order-total { font-family: 'Oswald', sans-serif; font-size: 20px; color: var(--ink); }
        .wrfc-order-total small { font-size: 12px; color: var(--ink-dim); font-family: 'Inter', sans-serif; margin-left: 6px; }
        .wrfc-reserve-btn {
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          background: var(--crimson);
          color: #fff;
          border: none;
          padding: 14px 32px;
          font-size: 15px;
          cursor: pointer;
          clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
        }
        .wrfc-reserve-btn:hover:not(:disabled) { background: #a11c2a; }
        .wrfc-reserve-btn:disabled { background: var(--line); cursor: not-allowed; }

        /* ---- Confirmation ---- */
        .wrfc-overlay {
          position: fixed; inset: 0;
          background: rgba(10,8,6,0.78);
          display: flex; align-items: center; justify-content: center;
          z-index: 40;
          padding: 20px;
        }
        .wrfc-ticket {
          background: var(--panel);
          border: 1px solid var(--line);
          max-width: 420px;
          width: 100%;
          position: relative;
        }
        .wrfc-ticket-top { padding: 28px 26px 22px; }
        .wrfc-ticket-stub-label {
          font-family: 'Oswald', sans-serif;
          color: var(--gold-bright);
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .wrfc-ticket-code {
          font-family: 'Oswald', sans-serif;
          font-size: 26px;
          color: var(--ink);
          margin-bottom: 18px;
        }
        .wrfc-ticket-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--ink-dim);
          padding: 6px 0;
          border-bottom: 1px dashed rgba(74,64,52,0.6);
        }
        .wrfc-ticket-row span:last-child { color: var(--ink); }
        .wrfc-perforation {
          height: 0;
          border-top: 2px dashed var(--line);
          margin: 0 26px;
          position: relative;
        }
        .wrfc-perforation::before, .wrfc-perforation::after {
          content: "";
          position: absolute;
          top: -10px;
          width: 20px; height: 20px;
          background: rgba(10,8,6,0.78);
          border-radius: 50%;
        }
        .wrfc-perforation::before { left: -30px; }
        .wrfc-perforation::after { right: -30px; }
        .wrfc-ticket-bottom { padding: 22px 26px 26px; }
        .wrfc-ticket-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 18px; }
        .wrfc-ticket-total-val { font-family: 'Oswald', sans-serif; font-size: 24px; color: var(--gold-bright); }
        .wrfc-close-btn {
          width: 100%;
          background: transparent;
          border: 1px solid var(--line);
          color: var(--ink);
          padding: 12px;
          font-family: 'Oswald', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          cursor: pointer;
          font-size: 13px;
        }
        .wrfc-close-btn:hover { border-color: var(--gold); color: var(--gold-bright); }
      `}</style>

      {/* Hero */}
      <div className="wrfc-hero">
        <div className="wrfc-hero-inner">
          <div className="wrfc-eyebrow display">Fighting Chip &mdash; Annual Card</div>
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
          <div className="wrfc-section-title display">The Card</div>
          <div className="wrfc-section-sub">Subject to change</div>
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

      {/* Tickets */}
      <div className="wrfc-section">
        <div className="wrfc-section-head">
          <div className="wrfc-section-title display">Reserve Tickets</div>
          <div className="wrfc-section-sub">Up to {MAX_PER_TIER} per tier</div>
        </div>
        {TICKET_TIERS.map((tier) => {
          const qty = quantities[tier.id] || 0;
          return (
            <div className="wrfc-tier" key={tier.id}>
              <div>
                <div className="wrfc-tier-name display">{tier.name}</div>
                <div className="wrfc-tier-blurb">{tier.blurb}</div>
                <div className="wrfc-tier-left display">{tier.left} left</div>
              </div>
              <div className="wrfc-tier-right">
                <div className="wrfc-tier-price display">
                  ${tier.price}
                  <small> / ticket</small>
                </div>
                <div className="wrfc-stepper">
                  <button
                    onClick={() => setQty(tier.id, qty - 1, MAX_PER_TIER)}
                    disabled={qty === 0}
                    aria-label={`Remove one ${tier.name} ticket`}
                  >
                    &minus;
                  </button>
                  <span className="wrfc-stepper-val">{qty}</span>
                  <button
                    onClick={() => setQty(tier.id, qty + 1, MAX_PER_TIER)}
                    disabled={qty >= MAX_PER_TIER}
                    aria-label={`Add one ${tier.name} ticket`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order bar */}
      <div className="wrfc-orderbar">
        <div className="wrfc-orderbar-inner">
          <div>
            <div className="wrfc-order-summary">
              {totalQty === 0
                ? "No tickets selected"
                : `${totalQty} ticket${totalQty > 1 ? "s" : ""} selected`}
            </div>
            <div className="wrfc-order-total display">
              ${total.toFixed(2)}
              <small>incl. ${fees.toFixed(2)} fees</small>
            </div>
          </div>
          <button
            className="wrfc-reserve-btn"
            disabled={totalQty === 0}
            onClick={handleReserve}
          >
            Reserve tickets
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
              {confirmed.items.map((item) => (
                <div className="wrfc-ticket-row" key={item.id}>
                  <span>
                    {item.qty} &times; {item.name}
                  </span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="wrfc-perforation" />
            <div className="wrfc-ticket-bottom">
              <div className="wrfc-ticket-total">
                <span className="wrfc-ticket-stub-label display">Total charged</span>
                <span className="wrfc-ticket-total-val display">
                  ${confirmed.total.toFixed(2)}
                </span>
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