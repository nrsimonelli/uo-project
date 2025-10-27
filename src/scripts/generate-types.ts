import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

interface EquipmentItem {
  id: string
  skillId: string | null
}

interface SkillItem {
  id: string
  type: string
}

interface PassiveSkillItem extends SkillItem {
  activationWindow?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Validation functions
function extractSkillReferencesFromClasses(): Set<string> {
  const classDataPath = path.resolve(__dirname, '../data/units/class-data.ts')
  const classDataContent = fs.readFileSync(classDataPath, 'utf-8')

  // Extract skill IDs using regex - looking for skillId: 'skillName' patterns
  const skillIdMatches = classDataContent.match(/skillId:\s*'([^']+)'/g) || []
  const skillIds = skillIdMatches
    .map(match => {
      const result = match.match(/skillId:\s*'([^']+)'/)
      return result ? result[1] : ''
    })
    .filter(Boolean)

  return new Set(skillIds)
}

function extractSkillReferencesFromEquipment(): Set<string> {
  const equipmentDir = path.resolve(__dirname, '../data/equipment')
  const skillIds = new Set<string>()

  const equipmentFiles = fs
    .readdirSync(equipmentDir)
    .filter(f => f.endsWith('.json'))

  for (const file of equipmentFiles) {
    const filePath = path.join(equipmentDir, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const equipment: EquipmentItem[] = JSON.parse(raw)

    for (const item of equipment) {
      if (item.skillId && item.skillId !== null) {
        skillIds.add(item.skillId)
      }
    }
  }

  return skillIds
}

function getDefinedSkills(): {
  activeSkills: Set<string>
  passiveSkills: Set<string>
} {
  const skillsDir = path.resolve(__dirname, '../data/skills')

  // Read active skills
  const activeSkillsPath = path.join(skillsDir, 'active.json')
  const activeSkillsRaw = fs.readFileSync(activeSkillsPath, 'utf-8')
  const activeSkills: SkillItem[] = JSON.parse(activeSkillsRaw)
  const activeSkillIds = new Set(activeSkills.map(skill => skill.id))

  // Read passive skills
  const passiveSkillsPath = path.join(skillsDir, 'passive.json')
  const passiveSkillsRaw = fs.readFileSync(passiveSkillsPath, 'utf-8')
  const passiveSkills: SkillItem[] = JSON.parse(passiveSkillsRaw)
  const passiveSkillIds = new Set(passiveSkills.map(skill => skill.id))

  return { activeSkills: activeSkillIds, passiveSkills: passiveSkillIds }
}

function getDefinedActivationWindows(): Set<string> {
  const activationWindowsPath = path.resolve(
    __dirname,
    '../data/activation-windows.ts'
  )
  const activationWindowsContent = fs.readFileSync(
    activationWindowsPath,
    'utf-8'
  )

  // Extract activation window IDs using regex - looking for id: 'windowName' patterns
  const windowIdMatches = activationWindowsContent.match(/id: '([^']+)'/g) || []
  const windowIds = windowIdMatches
    .map(match => {
      const result = match.match(/id: '([^']+)'/)
      return result ? result[1] : ''
    })
    .filter(Boolean)

  return new Set(windowIds)
}

function extractActivationWindowsFromPassiveSkills(): Set<string> {
  const passiveSkillsPath = path.resolve(
    __dirname,
    '../data/skills/passive.json'
  )
  const passiveSkillsRaw = fs.readFileSync(passiveSkillsPath, 'utf-8')
  const passiveSkills: PassiveSkillItem[] = JSON.parse(passiveSkillsRaw)

  const activationWindows = new Set<string>()

  for (const skill of passiveSkills) {
    if (skill.activationWindow) {
      activationWindows.add(skill.activationWindow)
    }
  }

  return activationWindows
}

function validateActivationWindows() {
  console.log('\n🪟 Validating activation windows...')

  // Get all referenced activation windows from passive skills
  const referencedWindows = extractActivationWindowsFromPassiveSkills()

  // Get all defined activation windows
  const definedWindows = getDefinedActivationWindows()

  // Find missing activation windows
  const missingWindows = new Set<string>()
  for (const window of referencedWindows) {
    if (!definedWindows.has(window)) {
      missingWindows.add(window)
    }
  }

  // Find unused activation windows (defined but not referenced)
  const unusedWindows = new Set<string>()
  for (const window of definedWindows) {
    if (!referencedWindows.has(window)) {
      unusedWindows.add(window)
    }
  }

  // Console output
  console.log(`📊 Activation Windows Summary:`)
  console.log(
    `   • Referenced in Passive Skills: ${referencedWindows.size} windows`
  )
  console.log(`   • Defined Windows: ${definedWindows.size} windows`)

  if (missingWindows.size > 0) {
    console.log(
      `\n❌ MISSING ACTIVATION WINDOWS (${missingWindows.size}):`,
      Array.from(missingWindows).sort()
    )
  } else {
    console.log(`\n✅ No missing activation windows found!`)
  }

  if (unusedWindows.size > 0) {
    console.log(
      `\n⚠️  UNUSED ACTIVATION WINDOWS (${unusedWindows.size}):`,
      Array.from(unusedWindows).sort()
    )
  }

  return { missingWindows, unusedWindows, referencedWindows, definedWindows }
}

function validateSkillReferences() {
  console.log('\n🔍 Validating skill references...')

  // Get all referenced skills
  const classSkills = extractSkillReferencesFromClasses()
  const equipmentSkills = extractSkillReferencesFromEquipment()
  const allReferencedSkills = new Set([...classSkills, ...equipmentSkills])

  // Get all defined skills
  const { activeSkills, passiveSkills } = getDefinedSkills()
  const allDefinedSkills = new Set([...activeSkills, ...passiveSkills])

  // Find missing skills
  const missingSkills = new Set<string>()
  for (const skill of allReferencedSkills) {
    if (!allDefinedSkills.has(skill)) {
      missingSkills.add(skill)
    }
  }

  // Find unused skills (defined but not referenced)
  const unusedSkills = new Set<string>()
  for (const skill of allDefinedSkills) {
    if (!allReferencedSkills.has(skill)) {
      unusedSkills.add(skill)
    }
  }

  // Validate activation windows
  const activationWindowValidation = validateActivationWindows()

  // Generate report
  const reportPath = path.resolve(
    __dirname,
    '../generated/skill-validation-report.md'
  )
  const report = generateValidationReport(
    classSkills,
    equipmentSkills,
    activeSkills,
    passiveSkills,
    missingSkills,
    unusedSkills,
    activationWindowValidation
  )

  fs.writeFileSync(reportPath, report, 'utf-8')

  // Console output
  console.log(`📊 Skill References Summary:`)
  console.log(`   • From Classes: ${classSkills.size} skills`)
  console.log(`   • From Equipment: ${equipmentSkills.size} skills`)
  console.log(`   • Total Referenced: ${allReferencedSkills.size} skills`)
  console.log(`   • Active Skills Defined: ${activeSkills.size} skills`)
  console.log(`   • Passive Skills Defined: ${passiveSkills.size} skills`)
  console.log(`   • Total Defined: ${allDefinedSkills.size} skills`)

  if (missingSkills.size > 0) {
    console.log(
      `\n❌ MISSING SKILLS (${missingSkills.size}):`,
      Array.from(missingSkills).sort()
    )
  } else {
    console.log(`\n✅ No missing skills found!`)
  }

  if (unusedSkills.size > 0) {
    console.log(
      `\n⚠️  UNUSED SKILLS (${unusedSkills.size}):`,
      Array.from(unusedSkills).sort()
    )
  }

  console.log(`📝 Full report written to: ${reportPath}`)
}

function generateValidationReport(
  classSkills: Set<string>,
  equipmentSkills: Set<string>,
  activeSkills: Set<string>,
  passiveSkills: Set<string>,
  missingSkills: Set<string>,
  unusedSkills: Set<string>,
  activationWindowValidation: {
    missingWindows: Set<string>
    unusedWindows: Set<string>
    referencedWindows: Set<string>
    definedWindows: Set<string>
  }
): string {
  const timestamp = new Date().toISOString()

  return `# Skill Validation Report

*Generated: ${timestamp}*

## Summary

- **Class Skills Referenced**: ${classSkills.size}
- **Equipment Skills Referenced**: ${equipmentSkills.size}
- **Total Skills Referenced**: ${new Set([...classSkills, ...equipmentSkills]).size}
- **Active Skills Defined**: ${activeSkills.size}
- **Passive Skills Defined**: ${passiveSkills.size}
- **Total Skills Defined**: ${activeSkills.size + passiveSkills.size}
- **Activation Windows Referenced**: ${activationWindowValidation.referencedWindows.size}
- **Activation Windows Defined**: ${activationWindowValidation.definedWindows.size}

## Missing Skills (Referenced but Not Defined)

${
  missingSkills.size === 0
    ? '✅ **No missing skills found!**'
    : `❌ **${missingSkills.size} missing skills:**\n\n${Array.from(
        missingSkills
      )
        .sort()
        .map(skill => `- \`${skill}\``)
        .join('\n')}`
}

## Unused Skills (Defined but Not Referenced)

${
  unusedSkills.size === 0
    ? '✅ **No unused skills found!**'
    : `⚠️ **${unusedSkills.size} unused skills:**\n\n${Array.from(unusedSkills)
        .sort()
        .map(skill => `- \`${skill}\``)
        .join('\n')}`
}

## Missing Activation Windows (Referenced but Not Defined)

${
  activationWindowValidation.missingWindows.size === 0
    ? '✅ **No missing activation windows found!**'
    : `❌ **${activationWindowValidation.missingWindows.size} missing activation windows:**\n\n${Array.from(
        activationWindowValidation.missingWindows
      )
        .sort()
        .map(window => `- \`${window}\``)
        .join('\n')}`
}

## Unused Activation Windows (Defined but Not Referenced)

${
  activationWindowValidation.unusedWindows.size === 0
    ? '✅ **No unused activation windows found!**'
    : `⚠️ **${activationWindowValidation.unusedWindows.size} unused activation windows:**\n\n${Array.from(
        activationWindowValidation.unusedWindows
      )
        .sort()
        .map(window => `- \`${window}\``)
        .join('\n')}`
}

## Skills by Source

### From Class Data (${classSkills.size})
${Array.from(classSkills)
  .sort()
  .map(skill => `- \`${skill}\``)
  .join('\n')}

### From Equipment Data (${equipmentSkills.size})
${Array.from(equipmentSkills)
  .sort()
  .map(skill => `- \`${skill}\``)
  .join('\n')}

### Active Skills Defined (${activeSkills.size})
${Array.from(activeSkills)
  .sort()
  .map(skill => `- \`${skill}\``)
  .join('\n')}

### Passive Skills Defined (${passiveSkills.size})
${Array.from(passiveSkills)
  .sort()
  .map(skill => `- \`${skill}\``)
  .join('\n')}

## Activation Windows

### Referenced in Passive Skills (${activationWindowValidation.referencedWindows.size})
${Array.from(activationWindowValidation.referencedWindows)
  .sort()
  .map(window => `- \`${window}\``)
  .join('\n')}

### Defined Activation Windows (${activationWindowValidation.definedWindows.size})
${Array.from(activationWindowValidation.definedWindows)
  .sort()
  .map(window => `- \`${window}\``)
  .join('\n')}
`
}

function generateSkillTsFile(
  jsonPath: string,
  outPath: string,
  exportName: string
) {
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw)
  const arrayContent = JSON.stringify(parsed, null, 2)

  // Determine skill type for proper TS type inference
  const baseType = exportName.startsWith('Active')
    ? 'ActiveSkill'
    : exportName.startsWith('Passive')
      ? 'PassiveSkill'
      : 'any'

  const tsContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: ${path.basename(jsonPath)}
import type { ${baseType} } from "@/types/skills"

export const ${exportName} = ${arrayContent} as const satisfies readonly ${baseType}[];

export type ${exportName}Id = (typeof ${exportName})[number]['id'];

export type ${exportName}Base = (typeof ${exportName})[number];

// Shared optional structure to allow property access on partial fields
type ${exportName}Shared = Partial<${baseType}>;

export type ${exportName}Map = {
  [K in ${exportName}Id]: Extract<${exportName}Base, { id: K }> & ${exportName}Shared;
};

export const ${exportName}Map: ${exportName}Map = Object.fromEntries(
  ${exportName}.map(item => [item.id, item])
) as ${exportName}Map;
`

  fs.writeFileSync(outPath, tsContent, 'utf-8')
  console.log(`✅ Generated file: ${path.basename(outPath)}`)
}

// === Equipment Generator (general-purpose data) ===
function generateEquipmentTsFile(
  jsonPath: string,
  outPath: string,
  exportName: string
) {
  const raw = fs.readFileSync(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw)
  const arrayContent = JSON.stringify(parsed, null, 2)

  const tsContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Source: ${path.basename(jsonPath)}

export const ${exportName} = ${arrayContent} as const;

export type ${exportName}Id = (typeof ${exportName})[number]['id'];

export type ${exportName}Map = {
  [K in ${exportName}Id]: Extract<(typeof ${exportName})[number], { id: K }>;
};

export const ${exportName}Map: ${exportName}Map = Object.fromEntries(
  ${exportName}.map(item => [item.id, item])
) as ${exportName}Map;
`

  fs.writeFileSync(outPath, tsContent, 'utf-8')
  console.log(`✅ Generated: ${path.basename(outPath)}`)
}

// === Directories ===
const skillsDir = path.resolve(__dirname, '../data/skills')
const equipmentDir = path.resolve(__dirname, '../data/equipment')
const outDir = path.resolve(__dirname, '../generated')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

// === Skills ===
generateSkillTsFile(
  path.join(skillsDir, 'active.json'),
  path.join(outDir, 'skills-active.ts'),
  'ActiveSkills'
)

generateSkillTsFile(
  path.join(skillsDir, 'passive.json'),
  path.join(outDir, 'skills-passive.ts'),
  'PassiveSkills'
)

// === Equipment ===
const equipmentFiles = fs
  .readdirSync(equipmentDir)
  .filter(f => f.endsWith('.json'))

for (const file of equipmentFiles) {
  const baseName = path.basename(file, '.json')
  const exportName = `Equipment${baseName[0].toUpperCase()}${baseName.slice(1)}`
  const outPath = path.join(outDir, `equipment-${baseName}.ts`)

  generateEquipmentTsFile(path.join(equipmentDir, file), outPath, exportName)
}

// === Skill Validation ===
validateSkillReferences()
