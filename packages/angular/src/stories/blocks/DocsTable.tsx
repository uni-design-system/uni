import React from 'react';

/**
 * Doc tables for MDX pages. The Storybook MDX pipeline has no GFM support, so
 * markdown pipe tables render as raw text — these blocks are the house way to
 * put tabular reference material (keyboard maps, migration diffs, token
 * tables) on a docs page. Styling mirrors ThemeOptionsBlock: neutral rgba
 * chrome, because docs prose renders on the plain docs canvas with no theme
 * wrapper.
 */

const cell: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid rgba(128,128,128,0.25)',
  textAlign: 'left',
  verticalAlign: 'top',
};

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12.5,
};

const keycap: React.CSSProperties = {
  ...code,
  display: 'inline-block',
  padding: '1px 6px',
  border: '1px solid rgba(128,128,128,0.4)',
  borderRadius: 4,
  background: 'rgba(128,128,128,0.08)',
  whiteSpace: 'nowrap',
};

export interface DocsTableProps {
  head: React.ReactNode[];
  rows: React.ReactNode[][];
  /** Column indexes rendered in the monospace code style. */
  codeColumns?: number[];
}

/** A generic docs table; cells take arbitrary JSX. */
export const DocsTable = ({ head, rows, codeColumns = [] }: DocsTableProps) => {
  if (rows.length === 0) return null;
  const cellStyle = (column: number): React.CSSProperties =>
    codeColumns.includes(column) ? { ...cell, ...code } : cell;

  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          {head.map((heading, column) => (
            <th key={column} style={cell}>
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {row.map((value, column) => (
              <td key={column} style={cellStyle(column)}>
                {value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export interface KeyboardRow {
  /** Key name(s); each renders as a keycap chip, joined with "/". */
  keys: string | string[];
  does: React.ReactNode;
}

const keycaps = (keys: string | string[]) => {
  const list = Array.isArray(keys) ? keys : [keys];
  return list.map((key, index) => (
    <React.Fragment key={key}>
      {index > 0 && <span style={{ opacity: 0.6 }}> / </span>}
      <span style={keycap}>{key}</span>
    </React.Fragment>
  ));
};

/** The Key/Behaviour table every interactive component's docs carry. */
export const KeyboardTable = ({
  rows,
  actionHead = 'Behaviour',
}: {
  rows: KeyboardRow[];
  actionHead?: React.ReactNode;
}) => (
  <DocsTable
    head={['Key', actionHead]}
    rows={rows.map(({ keys, does }) => [keycaps(keys), does])}
  />
);
