const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const stylesPath = path.join(root, "styles.css");
const appPath = path.join(root, "app.js");

describe("Sitio web estatico", () => {
  test("los 3 archivos requeridos existen en disco", () => {
    expect(fs.existsSync(indexPath)).toBe(true);
    expect(fs.existsSync(stylesPath)).toBe(true);
    expect(fs.existsSync(appPath)).toBe(true);
  });

  test("index.html existe y tiene estructura requerida", () => {
    const html = fs.readFileSync(indexPath, "utf8");

    expect(html).toMatch(/<!DOCTYPE html>/i);
    expect(html).toContain("<title>🚀 Mi Sitio Web</title>");
    expect(html).toMatch(/<link[^>]+href=["']styles\.css["']/);
    expect(html).toMatch(/<script[^>]+src=["']app\.js["']/);
    expect(html).toMatch(/<meta[^>]+name=["']viewport["']/);
    expect(html).toMatch(/<html[^>]+lang=["']es["']/);
    expect(html).toMatch(/class=["']stats["']/);
  });

  test("styles.css existe y tiene estilos para body", () => {
    const css = fs.readFileSync(stylesPath, "utf8");

    expect(css).toMatch(/body\s*\{/);
    expect(css).toMatch(/background/);
    expect(css).toMatch(/\.stats-grid/);
    expect(css).toMatch(/grid-template-columns:\s*repeat\(3,\s*1fr\)/);
  });

  test("app.js existe y tiene actualizarHora y DOMContentLoaded", () => {
    const js = fs.readFileSync(appPath, "utf8");

    expect(js).toMatch(/function\s+actualizarHora\s*\(/);
    expect(js).toContain("DOMContentLoaded");
    expect(js).toContain("localStorage");
  });
});
