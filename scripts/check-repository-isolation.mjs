import { lstat, readFile, readdir, readlink, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.py'])
const IGNORED_DIRECTORIES = new Set([
  '.git',
  '.agents',
  '.codex',
  '.github',
  '.impeccable',
  '.next',
  '.playwright-mcp',
  '.venv',
  'build',
  'coverage',
  'dist',
  'graphify-out',
  'node_modules',
  'out',
  'playwright-report',
  'test-results',
])

function isWithin(root, candidate) {
  const pathFromRoot = relative(root, candidate)
  return pathFromRoot === '' || (!pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot))
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

function packageMatches(specifier, forbiddenPackage) {
  const value = specifier.toLowerCase()
  const forbidden = forbiddenPackage.toLowerCase()
  return value === forbidden || value.startsWith(`${forbidden}/`)
}

function containsPeerIdentifier(value, forbiddenPackages) {
  const normalized = value.toLowerCase()
  return forbiddenPackages.some((forbiddenPackage) => {
    const escaped = forbiddenPackage
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9_])${escaped}([^a-z0-9_]|$)`).test(normalized)
  })
}

function sourceExtension(path) {
  const match = path.toLowerCase().match(/\.(?:[cm]?js|jsx|tsx?|py)$/)
  return match?.[0] || ''
}

function extractJavaScriptSpecifiers(text) {
  const matches = []
  const patterns = [
    /\b(?:from|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
  ]

  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      matches.push({ specifier: match[1], index: match.index || 0 })
    }
  }
  return matches
}

function extractPythonSpecifiers(text) {
  const matches = []
  for (const match of text.matchAll(/^\s*from\s+([A-Za-z_][\w.]*)\s+import\s+/gm)) {
    matches.push({ specifier: match[1], index: match.index || 0 })
  }
  for (const match of text.matchAll(/^\s*import\s+([^#\r\n]+)/gm)) {
    const modules = match[1].split(',').map((entry) => entry.trim().split(/\s+as\s+/)[0])
    for (const moduleName of modules) {
      if (moduleName) matches.push({ specifier: moduleName, index: match.index || 0 })
    }
  }
  return matches
}

function inspectImport({ root, path, text, forbiddenPackages }) {
  const violations = []
  const extension = sourceExtension(path)
  const specifiers = extension === '.py'
    ? extractPythonSpecifiers(text)
    : extractJavaScriptSpecifiers(text)

  for (const { specifier, index } of specifiers) {
    const line = lineNumber(text, index)
    const filesystemImport = specifier.startsWith('.') || isAbsolute(specifier) || /^[A-Za-z]:[\\/]/.test(specifier)

    if (filesystemImport) {
      const target = isAbsolute(specifier) || /^[A-Za-z]:[\\/]/.test(specifier)
        ? resolve(specifier)
        : resolve(dirname(path), specifier)
      if (!isWithin(root, target)) {
        violations.push({
          code: 'external-import',
          path,
          line,
          message: `import escapes repository root: ${specifier}`,
        })
      }
    }

    const bareSpecifier = !specifier.startsWith('.') && !specifier.startsWith('@/') && !isAbsolute(specifier)
    if (bareSpecifier && forbiddenPackages.some((peer) => packageMatches(specifier, peer))) {
      violations.push({
        code: 'forbidden-import',
        path,
        line,
        message: `direct peer-repository import is forbidden: ${specifier}`,
      })
    }

    if (/^(?:https?|file):/i.test(specifier)) {
      violations.push({
        code: 'url-import',
        path,
        line,
        message: `URL imports are forbidden; use the HTTP client boundary instead: ${specifier}`,
      })
    }
  }
  return violations
}

function dependencyEntries(manifest) {
  return ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']
    .flatMap((section) => Object.entries(manifest[section] || {}))
}

function inspectPackageManifest({ root, path, text, forbiddenPackages }) {
  const violations = []
  let manifest
  try {
    manifest = JSON.parse(text)
  } catch {
    return violations
  }

  for (const [name, rawSpec] of dependencyEntries(manifest)) {
    const spec = String(rawSpec)
    if (forbiddenPackages.some((peer) => packageMatches(name, peer))) {
      violations.push({
        code: 'forbidden-dependency',
        path,
        line: 1,
        message: `peer repository cannot be installed as package dependency: ${name}`,
      })
    }

    const localMatch = spec.match(/^(?:file|link):(.+)$/i)
    if (localMatch) {
      const target = resolve(dirname(path), localMatch[1])
      if (!isWithin(root, target)) {
        violations.push({
          code: 'external-dependency',
          path,
          line: 1,
          message: `local package dependency escapes repository root: ${name} -> ${spec}`,
        })
      }
    }

    if (containsPeerIdentifier(spec, forbiddenPackages)) {
      violations.push({
        code: 'peer-dependency-source',
        path,
        line: 1,
        message: `dependency source references peer repository: ${name} -> ${spec}`,
      })
    }
  }
  return violations
}

function inspectRequirements({ root, path, text, forbiddenPackages }) {
  const violations = []
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.replace(/\s+#.*$/, '').trim()
    if (!line) continue

    if (containsPeerIdentifier(line, forbiddenPackages)) {
      violations.push({
        code: 'forbidden-requirement',
        path,
        line: index + 1,
        message: `requirement references peer repository: ${line}`,
      })
    }

    const localValue = line.replace(/^-e\s+/, '').replace(/^file:/, '')
    if (/^(?:\.\.?[\\/]|[A-Za-z]:[\\/]|[\\/])/.test(localValue)) {
      const target = resolve(dirname(path), localValue)
      if (!isWithin(root, target)) {
        violations.push({
          code: 'external-requirement',
          path,
          line: index + 1,
          message: `local requirement escapes repository root: ${line}`,
        })
      }
    }
  }
  return violations
}

async function collectRepository(root, violations) {
  const files = []

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.codex') || entry.name.startsWith('.tmp')) continue
      const path = resolve(directory, entry.name)
      const stats = await lstat(path)

      if (stats.isSymbolicLink()) {
        const rawTarget = await readlink(path)
        const target = await realpath(path).catch(() => resolve(dirname(path), rawTarget))
        if (!isWithin(root, target)) {
          violations.push({
            code: 'external-symlink',
            path,
            line: 1,
            message: `symlink escapes repository root: ${rawTarget}`,
          })
        }
        continue
      }
      if (entry.isDirectory()) {
        await visit(path)
      } else if (entry.isFile()) {
        files.push(path)
      }
    }
  }

  await visit(root)
  return files
}

export async function inspectRepository({
  root,
  sourceRoots,
  forbiddenPackages,
}) {
  const normalizedRoot = resolve(root)
  const normalizedSources = sourceRoots.map((source) => resolve(normalizedRoot, source))
  const violations = []
  const files = await collectRepository(normalizedRoot, violations)
  let sourceFilesScanned = 0

  if (files.some((path) => relative(normalizedRoot, path).replaceAll('\\', '/') === '.gitmodules')) {
    violations.push({
      code: 'submodule',
      path: resolve(normalizedRoot, '.gitmodules'),
      line: 1,
      message: 'git submodules are forbidden by the repository-isolation boundary',
    })
  }

  for (const path of files) {
    const filename = path.split(/[\\/]/).at(-1) || ''
    const isSource = normalizedSources.some((sourceRoot) => isWithin(sourceRoot, path))
    const isPackageManifest = filename === 'package.json'
    const isRequirements = /^requirements.*\.txt$/i.test(filename)
    if (!isSource && !isPackageManifest && !isRequirements) continue
    const text = await readFile(path, 'utf8')

    if (isSource && SOURCE_EXTENSIONS.has(sourceExtension(path))) {
      sourceFilesScanned += 1
      violations.push(...inspectImport({ root: normalizedRoot, path, text, forbiddenPackages }))
    }
    if (isPackageManifest) {
      violations.push(...inspectPackageManifest({ root: normalizedRoot, path, text, forbiddenPackages }))
    }
    if (isRequirements) {
      violations.push(...inspectRequirements({ root: normalizedRoot, path, text, forbiddenPackages }))
    }
  }

  return {
    sourceFilesScanned,
    violations: violations.sort((left, right) =>
      left.path.localeCompare(right.path) || left.line - right.line || left.code.localeCompare(right.code)),
  }
}

function parseArguments(argv) {
  const options = { root: '.', sourceRoots: [], forbiddenPackages: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const value = argv[index + 1]
    if (argument === '--root' && value) options.root = value
    else if (argument === '--source' && value) options.sourceRoots.push(value)
    else if (argument === '--forbid-package' && value) options.forbiddenPackages.push(value)
    else throw new Error(`Unknown or incomplete argument: ${argument}`)
    index += 1
  }
  if (!options.sourceRoots.length) throw new Error('At least one --source is required')
  if (!options.forbiddenPackages.length) throw new Error('At least one --forbid-package is required')
  return options
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const result = await inspectRepository(options)
  if (!result.violations.length) {
    console.log(`Repository isolation passed (${result.sourceFilesScanned} source files checked).`)
    return
  }

  console.error('Repository isolation failed:')
  for (const violation of result.violations) {
    const path = relative(resolve(options.root), violation.path).replaceAll('\\', '/')
    console.error(`- ${path}:${violation.line} [${violation.code}] ${violation.message}`)
  }
  process.exitCode = 1
}

const isMain = process.argv[1]
  && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
if (isMain) await main()
