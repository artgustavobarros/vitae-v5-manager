import { readFileSync } from 'node:fs'
import ts from 'typescript'

import { findNativeSelects } from './ui-rules.ts'

const files = ts.sys.readDirectory('src', ['.tsx'], undefined, ['**/*.tsx'])
const violations = files.flatMap((file) =>
  findNativeSelects(file, readFileSync(file, 'utf8')).map((line) => `${file}:${line}: native <select> is forbidden`),
)

if (violations.length) {
  console.error(violations.join('\n'))
  process.exitCode = 1
} else {
  console.log('UI rule check passed: no native <select> tags.')
}
