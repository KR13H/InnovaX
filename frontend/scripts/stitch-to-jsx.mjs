// Converts a Google Stitch code.html export into a React component body (JSX),
// preserving Tailwind classes and HTML whitespace semantics.
// Usage: node scripts/stitch-to-jsx.mjs <code.html> <ComponentName> <out.tsx>
import fs from "node:fs";
import { parse, NodeType } from "node-html-parser";

const [, , src, name, out] = process.argv;
const html = fs.readFileSync(src, "utf8");
const root = parse(html, { comment: true, blockTextElements: { script: true, style: true, pre: true } });
const body = root.querySelector("body");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const ATTR = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength",
  minlength: "minLength", autocomplete: "autoComplete", autofocus: "autoFocus", autoplay: "autoPlay",
  playsinline: "playsInline", crossorigin: "crossOrigin", enctype: "encType", inputmode: "inputMode",
  srcset: "srcSet", colspan: "colSpan", rowspan: "rowSpan", contenteditable: "contentEditable",
  spellcheck: "spellCheck", novalidate: "noValidate", "accept-charset": "acceptCharset",
  viewbox: "viewBox", preserveaspectratio: "preserveAspectRatio", "xlink:href": "xlinkHref",
  "xmlns:xlink": "xmlnsXlink", "xml:space": "xmlSpace", gradientunits: "gradientUnits",
  gradienttransform: "gradientTransform", stddeviation: "stdDeviation", patternunits: "patternUnits",
};
const BOOL = new Set(["disabled", "checked", "selected", "readOnly", "required", "multiple", "hidden", "autoFocus", "autoPlay", "muted", "loop", "playsInline", "controls", "noValidate", "open"]);
const todos = [];

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function attrName(k) {
  const lk = k.toLowerCase();
  if (ATTR[lk]) return ATTR[lk];
  if (lk.startsWith("data-") || lk.startsWith("aria-")) return lk;
  if (lk.includes("-") || lk.includes(":")) return camel(lk.replace(":", "-"));
  return k;
}
function styleObj(s) {
  const parts = [];
  for (const decl of s.split(/;(?![^(]*\))/)) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    let p = decl.slice(0, i).trim(), v = decl.slice(i + 1).trim();
    if (!p) continue;
    p = p.startsWith("--") ? JSON.stringify(p) : camel(p.replace(/^-ms-/, "ms-"));
    parts.push(`${p}: ${JSON.stringify(v.replace(/&quot;/g, '"').replace(/&amp;/g, "&"))}`);
  }
  return `{{ ${parts.join(", ")} }}`;
}
const decode = (v) => v.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
// Attribute values are decoded so Tailwind sees the same class strings the browser does (e.g. `[&_span]:x`).
const attrVal = (v) => {
  const d = decode(v);
  return /["{}\\&<>]/.test(d) || d.includes("\n") ? `{${JSON.stringify(d)}}` : `"${d}"`;
};

function isFlexish(el) {
  const c = (el.getAttribute && el.getAttribute("class")) || "";
  return /(^|\s)(inline-)?(flex|grid)(\s|$)/.test(c);
}
const escText = (t) => t.replace(/[{}<>]/g, (c) => `{"${c}"}`);

function conv(node, parent, depth) {
  const pad = "  ".repeat(depth);
  if (node.nodeType === NodeType.COMMENT_NODE) {
    const t = node.rawText.trim().replace(/\*\//g, "* /");
    return t ? `${pad}{/* ${t} */}\n` : "";
  }
  if (node.nodeType === NodeType.TEXT_NODE) {
    const raw = node.rawText;
    const sibs = parent ? parent.childNodes : [];
    const idx = sibs.indexOf(node);
    const prevSib = idx > 0 ? sibs[idx - 1] : null, nextSib = idx >= 0 && idx < sibs.length - 1 ? sibs[idx + 1] : null;
    if (/^\s*$/.test(raw)) {
      if (!raw.length || (parent && isFlexish(parent))) return "";
      if (parent && parent.closest && (parent.closest("svg") || parent.closest("select"))) return ""; // no text nodes inside SVG/<select>
      if (!prevSib || !nextSib) return ""; // leading/trailing whitespace in a block collapses away
      return `${pad}{" "}\n`;
    }
    const lead = /^\s/.test(raw) && prevSib ? '{" "}' : "";
    const trail = /\s$/.test(raw) && nextSib ? '{" "}' : "";
    return `${pad}${lead}${escText(raw.replace(/\s+/g, " ").trim())}${trail}\n`;
  }
  const tag = node.rawTagName;
  if (!tag) return node.childNodes.map((c) => conv(c, parent, depth)).join("");
  const SVG_TAGS = { lineargradient: "linearGradient", radialgradient: "radialGradient", clippath: "clipPath", fegaussianblur: "feGaussianBlur", femerge: "feMerge", femergenode: "feMergeNode", feoffset: "feOffset", feblend: "feBlend", fecolormatrix: "feColorMatrix", textpath: "textPath", foreignobject: "foreignObject", animatetransform: "animateTransform", animatemotion: "animateMotion" };
  const t = SVG_TAGS[tag.toLowerCase()] || tag.toLowerCase();
  if (t === "script" || t === "style") return "";
  const attrs = [];
  for (const [k, v] of Object.entries(node.rawAttributes)) {
    const lk = k.toLowerCase();
    if (lk.startsWith("on")) { todos.push(`${t}#${node.getAttribute("id") || ""} ${k}="${v}"`); attrs.push(`data-todo-${lk}=${attrVal(v)}`); continue; }
    let n = attrName(k);
    if (n === "style") { attrs.push(`style=${styleObj(v)}`); continue; }
    if (t === "input" || t === "textarea" || t === "select") {
      if (n === "value") n = "defaultValue";
      if (n === "checked") n = "defaultChecked";
    }
    if (t === "option" && n === "selected") { todos.push(`option selected: ${v}`); continue; }
    if (BOOL.has(n) && (v === "" || v === n || v.toLowerCase() === k.toLowerCase())) { attrs.push(n); continue; }
    if (n === "defaultChecked" && v === "") { attrs.push("defaultChecked"); continue; }
    attrs.push(`${n}=${attrVal(v)}`);
  }
  const open = `<${t}${attrs.length ? " " + attrs.join(" ") : ""}`;
  if (VOID.has(t)) return `${pad}${open} />\n`;
  if (t === "textarea") {
    const txt = node.text;
    return `${pad}${open}${txt.trim() ? ` defaultValue=${JSON.stringify(txt)}` : ""} />\n`;
  }
  const kids = node.childNodes.map((c) => conv(c, node, depth + 1)).join("");
  if (!kids.trim()) return `${pad}${open}></${t}>\n`;
  return `${pad}${open}>\n${kids}${pad}</${t}>\n`;
}

const bodyClass = body.getAttribute("class") || "";
const inner = body.childNodes.map((c) => conv(c, body, 3)).join("");
const code = `"use client";

// Generated from ${src.replace(/^.*design\//, "design/")} by scripts/stitch-to-jsx.mjs.
export default function ${name}() {
  return (
    <div className=${JSON.stringify(bodyClass)}>
${inner}    </div>
  );
}
`;
fs.writeFileSync(out, code);
if (todos.length) console.log(`${name}: ${todos.length} inline handlers\n  ` + todos.join("\n  "));
