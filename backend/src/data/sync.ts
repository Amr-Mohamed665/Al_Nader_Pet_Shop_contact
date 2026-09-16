import fs from 'fs';
import path from 'path';

const srcPath = 'C:\\Users\\custo\\.gemini\\antigravity-ide\\brain\\fbe17979-3d5d-424c-8653-797d9d969588\\.system_generated\\steps\\187\\content.md';
try {
  const content = fs.readFileSync(srcPath, 'utf8');

  // Find the line containing success:true
  const line = content.split('\n').find((l) => l.includes('"success":true'));
  if (line) {
    interface StepResponse {
      data: unknown;
    }
    const parsed = JSON.parse(line.trim()) as StepResponse;
    const products = parsed.data;

    const destJson = path.join(__dirname, 'menuItems.json');
    const destSeed = path.join(__dirname, 'menuItems.seed.json');

    fs.writeFileSync(destJson, JSON.stringify(products, null, 2), 'utf8');
    fs.writeFileSync(destSeed, JSON.stringify(products, null, 2), 'utf8');
    console.log('Successfully synced local menuItems.json and menuItems.seed.json with pet shop products!');
  } else {
    console.error('Could not find products line in content.md');
  }
} catch (err: unknown) {
  console.error('Failed to run sync script:', (err as Error).message);
}
