/**
 * esbuild build script for neiki-page-editor.
 * Produces all 4 dist outputs:
 *   dist/neiki-page-editor.min.js   — CDN, minified, embedded CSS, window.NeikiPageEditor
 *   dist/neiki-page-editor.js       — UMD unminified
 *   dist/neiki-page-editor.esm.js   — ES module for bundlers
 *   dist/neiki-page-editor.css      — standalone editor CSS
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const srcEntry = path.join(__dirname, 'src', 'neiki-page-editor.js');
const cssEntry = path.join(__dirname, 'src', 'neiki-page-editor.css');
const distDir = path.join(__dirname, 'dist');

// Ensure dist/ exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Read the CSS source to embed into the CDN min.js build
const cssSource = fs.readFileSync(cssEntry, 'utf8');

// Plugin to inject CSS as a runtime string constant before bundling the min.js
const embedCssPlugin = {
  name: 'embed-css',
  setup(build) {
    // Intercept import of the CSS file in the JS entry and return it as a JS module
    build.onLoad({ filter: /neiki-page-editor\.css$/ }, () => ({
      contents: `export const EDITOR_CSS = ${JSON.stringify(cssSource)};`,
      loader: 'js',
    }));
  },
};

async function buildAll() {
  const sharedOptions = {
    entryPoints: [srcEntry],
    bundle: true,
    sourcemap: false,
    target: ['es2017'],
    logLevel: 'info',
  };

  // 1. CDN minified build — IIFE exposing window.NeikiPageEditor, with embedded CSS
  await esbuild.build({
    ...sharedOptions,
    outfile: path.join(distDir, 'neiki-page-editor.min.js'),
    format: 'iife',
    globalName: 'NeikiPageEditor',
    minify: true,
    plugins: [embedCssPlugin],
    banner: {
      js: '/* neiki-page-editor | Source Available License */',
    },
    footer: {
      // After the IIFE the module result is assigned to globalName by esbuild.
      // Expose the default export (the class) as window.NeikiPageEditor.
      js: 'if(typeof window!=="undefined"&&typeof NeikiPageEditor!=="undefined"){window.NeikiPageEditor=NeikiPageEditor.default||NeikiPageEditor;}',
    },
  });

  // 2. UMD unminified build
  await esbuild.build({
    ...sharedOptions,
    outfile: path.join(distDir, 'neiki-page-editor.js'),
    format: 'cjs',
    minify: false,
    plugins: [embedCssPlugin],
    banner: {
      js: '/* neiki-page-editor | Source Available License */',
    },
  });

  // 3. ESM build for bundlers
  await esbuild.build({
    ...sharedOptions,
    outfile: path.join(distDir, 'neiki-page-editor.esm.js'),
    format: 'esm',
    minify: false,
    plugins: [embedCssPlugin],
    banner: {
      js: '/* neiki-page-editor | Source Available License */',
    },
  });

  // 4. Standalone CSS — just copy the source CSS
  fs.copyFileSync(cssEntry, path.join(distDir, 'neiki-page-editor.css'));
  console.log('  dist/neiki-page-editor.css (copied)');

  console.log('\nBuild complete. dist/ contents:');
  fs.readdirSync(distDir).forEach(f => {
    const size = fs.statSync(path.join(distDir, f)).size;
    console.log(`  ${f} (${(size / 1024).toFixed(1)} KB)`);
  });
}

buildAll().catch(err => {
  console.error(err);
  process.exit(1);
});
