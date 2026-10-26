import { describe, expect, it } from 'vitest'

import { findNativeSelects } from './ui-rules.ts'

describe('findNativeSelects', () => {
  it('finds native select tags and ignores component names', () => {
    expect(findNativeSelects('form.tsx', '<Select />\n<select value="clan" />')).toEqual([2])
  })
})
