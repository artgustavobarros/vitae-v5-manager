import ts from 'typescript'

export function findNativeSelects(fileName: string, source: string): number[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const lines: number[] = []

  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === 'select'
    ) {
      lines.push(file.getLineAndCharacterOfPosition(node.tagName.getStart(file)).line + 1)
    }

    ts.forEachChild(node, visit)
  }

  visit(file)
  return lines
}
