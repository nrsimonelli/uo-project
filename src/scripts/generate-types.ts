import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function generateTsFile(jsonPath: string, outPath: string, exportName: string) {
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw)

  // stringify pretty
  const arrayContent = JSON.stringify(parsed, null, 2)

  const tsContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: ${path.basename(jsonPath)}

export const ${exportName} = ${arrayContent} as const;

export type ${exportName}Id = (typeof ${exportName})[number]["id"];

export type ${exportName}Map = {
  [K in ${exportName}Id]: Extract<(typeof ${exportName})[number], { id: K }>;
};

export const ${exportName}Map: ${exportName}Map = Object.fromEntries(
  ${exportName}.map(item => [item.id, item])
) as ${exportName}Map;
`

  fs.writeFileSync(outPath, tsContent, 'utf-8')
  console.log(`✅ Generated ${outPath}`)
}

// === Directories ===
const skillsDir = path.resolve(__dirname, '../data/skills')
const equipmentDir = path.resolve(__dirname, '../data/equipment')
const outDir = path.resolve(__dirname, '../generated')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

// === Skills ===
generateTsFile(
  path.join(skillsDir, 'active.json'),
  path.join(outDir, 'skills-active.ts'),
  'ActiveSkills'
)

generateTsFile(
  path.join(skillsDir, 'passive.json'),
  path.join(outDir, 'skills-passive.ts'),
  'PassiveSkills'
)

// === Equipment ===
const equipmentFiles = fs
  .readdirSync(equipmentDir)
  .filter((f) => f.endsWith('.json'))

for (const file of equipmentFiles) {
  const baseName = path.basename(file, '.json')
  const exportName = `Equipment${baseName[0].toUpperCase()}${baseName.slice(1)}`
  const outPath = path.join(outDir, `equipment-${baseName}.ts`)

  generateTsFile(path.join(equipmentDir, file), outPath, exportName)
}
