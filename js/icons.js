/* FLORARIUM — генератор плоских SVG-иллюстраций растений.
   Изображения не являются точной ботанической иллюстрацией:
   это стилизованные флэт-иконки, собранные из базовых примитивов. */
window.App = window.App || {};

(function () {
  const VB = 240;
  const BASE_X = 120;
  const BASE_Y = 196;

  function leaf(x, y, len, width, angle, fill, veinColor) {
    const vein = veinColor
      ? `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - len * 0.86}" stroke="${veinColor}" stroke-width="1.4" stroke-linecap="round" opacity="0.55" transform="rotate(${angle} ${x} ${y})"/>`
      : "";
    return `<g>
      <path d="M ${x} ${y}
        C ${x - width} ${y - len * 0.35}, ${x - width * 0.4} ${y - len * 0.82}, ${x} ${y - len}
        C ${x + width * 0.4} ${y - len * 0.82}, ${x + width} ${y - len * 0.35}, ${x} ${y} Z"
        fill="${fill}" transform="rotate(${angle} ${x} ${y})"/>
      ${vein}
    </g>`;
  }

  function roundLeaf(x, y, r, angle, dist, fill) {
    const cx = x + Math.sin((angle * Math.PI) / 180) * dist;
    const cy = y - Math.cos((angle * Math.PI) / 180) * dist;
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.86}" fill="${fill}" transform="rotate(${angle * 0.3} ${cx} ${cy})"/>`;
  }

  function stem(x1, y1, x2, y2, color, width) {
    return `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2 + 10} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="${color}" stroke-width="${width || 3}" fill="none" stroke-linecap="round"/>`;
  }

  function pot(potColor) {
    return `
      <ellipse cx="${BASE_X}" cy="${BASE_Y + 4}" rx="46" ry="10" fill="#00000022"/>
      <path d="M ${BASE_X - 42} ${BASE_Y} L ${BASE_X - 34} ${BASE_Y + 40} Q ${BASE_X} ${BASE_Y + 50} ${BASE_X + 34} ${BASE_Y + 40} L ${BASE_X + 42} ${BASE_Y} Z" fill="${potColor}"/>
      <path d="M ${BASE_X - 46} ${BASE_Y - 8} h 92 v 10 a 4 4 0 0 1 -4 4 h -84 a 4 4 0 0 1 -4 -4 Z" fill="${potColor}" opacity="0.92"/>
      <ellipse cx="${BASE_X}" cy="${BASE_Y - 8}" rx="42" ry="8" fill="#3a2a1f" opacity="0.35"/>
    `;
  }

  function frameSvg(inner, bg) {
    return `<svg viewBox="0 0 ${VB} ${VB}" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <rect width="${VB}" height="${VB}" fill="${bg}"/>
      ${inner}
    </svg>`;
  }

  function fanLeaves(count, len, width, spread, colors, veined) {
    let out = "";
    const start = -spread / 2;
    for (let i = 0; i < count; i++) {
      const angle = count === 1 ? 0 : start + (spread / (count - 1)) * i;
      const shade = i % 2 === 0 ? colors.leaf : colors.leafDark;
      out += leaf(BASE_X, BASE_Y - 6, len, width, angle, shade, veined ? colors.leafDark : null);
    }
    return out;
  }

  function rosette(count, len, width, colors) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const shade = i % 3 === 0 ? colors.leafDark : colors.leaf;
      out += leaf(BASE_X, BASE_Y + 4, len, width, angle, shade, null);
    }
    return out;
  }

  function trailing(count, colors, round) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const angle = -70 + (140 / (count - 1)) * i;
      const dist = 30 + (i % 2) * 14;
      const ex = BASE_X + Math.sin((angle * Math.PI) / 180) * dist;
      const ey = BASE_Y - 4 - Math.cos((angle * Math.PI) / 180) * dist * 0.6;
      out += stem(BASE_X, BASE_Y - 6, ex, ey, colors.leafDark, 2.2);
      out += round
        ? roundLeaf(BASE_X, BASE_Y - 6, 12, angle, dist, i % 2 === 0 ? colors.leaf : colors.leafDark)
        : leaf(ex, ey, 22, 9, angle, colors.leaf, null);
    }
    return out;
  }

  function treeCanopy(colors, style) {
    const trunk = `<path d="M ${BASE_X - 4} ${BASE_Y - 4} C ${BASE_X - 10} ${BASE_Y - 40}, ${BASE_X + 8} ${BASE_Y - 70}, ${BASE_X} ${BASE_Y - 108}"
      stroke="${colors.leafDark}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    if (style === "bushy") {
      let blobs = "";
      const spots = [[-18, -100], [16, -108], [-2, -92], [26, -84], [-24, -78], [4, -122]];
      spots.forEach(([dx, dy], i) => {
        blobs += `<ellipse cx="${BASE_X + dx}" cy="${BASE_Y + dy}" rx="20" ry="16" fill="${i % 2 ? colors.leafDark : colors.leaf}"/>`;
      });
      return trunk + blobs;
    }
    if (style === "palm") {
      let fronds = "";
      const top = { x: BASE_X, y: BASE_Y - 108 };
      const count = 7;
      for (let i = 0; i < count; i++) {
        const angle = -100 + (200 / (count - 1)) * i;
        fronds += leaf(top.x, top.y, 58, 13, angle, i % 2 ? colors.leafDark : colors.leaf, colors.leafDark);
      }
      return trunk + fronds;
    }
    if (style === "starburst") {
      let blades = "";
      const top = { x: BASE_X, y: BASE_Y - 108 };
      const count = 9;
      for (let i = 0; i < count; i++) {
        const angle = -90 + (180 / (count - 1)) * i;
        blades += leaf(top.x, top.y, 34, 6, angle, i % 2 ? colors.leafDark : colors.leaf, null);
      }
      return trunk + blades;
    }
    return trunk;
  }

  function paddlePlant(colors, count) {
    let out = "";
    for (let i = 0; i < count; i++) {
      const angle = -34 + (68 / (count - 1)) * i;
      const len = 96 + (i % 2) * 10;
      out += stem(BASE_X, BASE_Y - 4, BASE_X + Math.sin((angle * Math.PI) / 180) * 8, BASE_Y - len * 0.7, colors.leafDark, 3.4);
      out += leaf(BASE_X, BASE_Y - len * 0.62, len * 0.5, 20, angle, i % 2 ? colors.leafDark : colors.leaf, colors.leafDark);
    }
    return out;
  }

  function succulentCluster(colors) {
    const trunk = `<path d="M ${BASE_X} ${BASE_Y - 2} L ${BASE_X} ${BASE_Y - 54}" stroke="${colors.leafDark}" stroke-width="7" stroke-linecap="round"/>`;
    let blobs = "";
    const spots = [[-16, -70], [14, -76], [0, -58], [24, -50], [-24, -46], [2, -92]];
    spots.forEach(([dx, dy], i) => {
      blobs += `<ellipse cx="${BASE_X + dx}" cy="${BASE_Y + dy}" rx="15" ry="12" fill="${i % 2 ? colors.leafDark : colors.leaf}"/>`;
    });
    return trunk + blobs;
  }

  function build(shape, colors) {
    switch (shape) {
      case "monstera":
        return fanLeaves(3, 92, 46, 70, colors, true);
      case "fiddle":
        return fanLeaves(3, 88, 50, 56, colors, true);
      case "rubber":
        return fanLeaves(3, 96, 42, 46, colors, true);
      case "philodendron":
        return fanLeaves(4, 60, 34, 100, colors, true);
      case "broadleaf-stripe":
        return fanLeaves(4, 70, 38, 110, colors, true);
      case "spath": {
        const leaves = fanLeaves(4, 74, 30, 90, colors, true);
        const flower = `<path d="M ${BASE_X + 10} ${BASE_Y - 70} C ${BASE_X - 6} ${BASE_Y - 118}, ${BASE_X + 26} ${BASE_Y - 128}, ${BASE_X + 20} ${BASE_Y - 86} Z" fill="#f7f3ec"/>
          <line x1="${BASE_X + 10}" y1="${BASE_Y - 68}" x2="${BASE_X + 14}" y2="${BASE_Y - 10}" stroke="${colors.leafDark}" stroke-width="2.4"/>`;
        return leaves + flower;
      }
      case "zz":
        return fanLeaves(5, 84, 16, 90, colors, false);
      case "snake":
        return fanLeaves(5, 100, 20, 46, colors, true);
      case "dracaena":
        return treeCanopy(colors, "starburst");
      case "palm":
        return treeCanopy(colors, "palm");
      case "strelitzia":
        return paddlePlant(colors, 4);
      case "succulent-tree":
        return succulentCluster(colors);
      case "rosette":
        return rosette(8, 46, 20, colors);
      case "haworthia":
        return rosette(9, 34, 12, colors);
      case "coin":
        return trailing(5, colors, true);
      case "hoya":
        return trailing(5, colors, false);
      case "spider":
        return trailing(6, colors, false);
      default:
        return fanLeaves(3, 80, 40, 70, colors, true);
    }
  }

  App.icons = {
    plant(shape, colors, bg) {
      const inner = build(shape, colors) + pot(colors.pot);
      return frameSvg(inner, bg || "transparent");
    }
  };
})();
