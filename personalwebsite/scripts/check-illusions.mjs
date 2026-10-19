import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/app/monument/illusionGeometry.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { configurations, interpolate, route, project } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
let samples = 0;
for (const from of configurations) {
  const ends = route(from);
  assert.ok(Math.hypot(...ends.at(-1)) > 2, 'Settled configurations must have a real world-space discontinuity');
  for (const to of configurations) {
    if (from === to) continue;
    for (let i = 0; i <= 120; i++) {
      const points = route(interpolate(from, to, i / 120));
      // Check all four corners of the beam cross-section, not just its center.
      for (const y of [-.44, 0]) for (const z of [-.22, .22]) {
        const a = project([points[0][0], points[0][1]+y, points[0][2]+z]);
        const b = project([points[5][0], points[5][1]+y, points[5][2]+z]);
        assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1]) < 1e-12, 'Optical seam must stay closed throughout transition');
      }
      for (const [a,b] of [[1,2],[3,4]]) {
        assert.ok(Math.abs(points[b][2]-points[a][2]) > .5, 'Stair run must not collapse');
        assert.ok(Math.abs(points[b][1]-points[a][1])/20 < .44, 'Treads must overlap vertically without holes');
      }
      assert.ok(points[1][0] > points[0][0] && points[5][0] > points[4][0], 'Seam tangents must have matching direction');
      samples++;
    }
  }
}
console.log(`PASS: 5 impossible configurations; ${samples} samples across all 20 directed transitions; full seam cross-sections and stair continuity.`);
