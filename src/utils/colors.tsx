import chroma from 'chroma-js';
export const IBM_COLORS = [
  '#648FFF',
  '#785EF0',
  '#DC267F',
  '#FE6100',
  '#FFB000',
];

const expandPalette = (colors: string[]): string[] => {
  let expandedColors: string[] = [];
  expandedColors.push(...colors);

  colors.forEach((color) => {
    expandedColors.push(chroma(color).brighten(2).hex());
  });

  colors.forEach((color) => {
    expandedColors.push(chroma(color).darken(2).hex());
  });
  return expandedColors;
};
const FULL_PALETTE = expandPalette(IBM_COLORS);
FULL_PALETTE.splice(1, 1);
export const IBM_EXPANDED_COLORS = FULL_PALETTE;

export function PaletteDemo() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px', // Spacing between squares
      }}
    >
      {IBM_EXPANDED_COLORS.map((color, index) => (
        <div
          key={index}
          style={{
            width: '20px',
            height: '10px',
            backgroundColor: color,
          }}
        ></div>
      ))}
    </div>
  );
}
