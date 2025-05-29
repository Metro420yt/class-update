import { debug, error, ExitCode, getInput, isDebug, setOutput } from '@actions/core'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

var __root = dirname(import.meta.dirname)
const doDebug = isDebug()

const options = {
    folder: 'themes',
    ext: 'css',
    diff: 'https://raw.githubusercontent.com/SyndiShanX/Update-Classes/main/Changes.txt'
} satisfies Record<string, string>

for (const key in options) {
    const value = getInput(key) as string
    if (value) options[key as keyof typeof options] = value
}

if (!options.ext.startsWith('.')) options.ext = '.' + options.ext



const targetFolder = join(process.cwd(), options.folder) // [ ]: maybe do resolve()
debug(`target: ${targetFolder}`)
if (!existsSync(targetFolder)) {
    error(`folder doesnt exist ${options.folder} (${targetFolder})`)
    process.exit(ExitCode.Failure)
}
const files = getFiles(targetFolder)


const pairs = await getPairs(options.diff)
const stats: { [key: string]: number } = {}
for (const [oldClass, newClass] of pairs) {
    for (let i = 0; files.length > i; i++) {
        files[i].txt = files[i].txt
            .replaceAll(oldClass, () => {
                if (stats[files[i].file]) stats[files[i].file]++
                else stats[files[i].file] = 1

                return newClass
            })
    }
}

const total = Object.values(stats).reduce((total, num) => total += num, 0)
setOutput('totalChanges', total)

if (doDebug) {
    debug(`${total} changes`)
    for (const file in stats) debug(`  ${stats[file]} ${file}`)
}

files.forEach(({ file, txt }) => {
    if (stats[file] > 0) writeFileSync(join(targetFolder, file), txt)
})



async function getPairs(diffSource: string): Promise<Array<[string, string]>> {
    var file: string
    if (diffSource.startsWith('http')) {
        debug(`fetching diff: ${diffSource}`)
        const resp = await fetch(diffSource)
        if (!resp.ok) {
            error(`bad response\n  ${resp.status} ${resp.url}`)
            process.exit(ExitCode.Failure)
        }
        file = await resp.text()
    }
    else if (existsSync(join(__root, diffSource))) {
        debug('Using local diff source')
        file = readFileSync(join(__root, diffSource), 'utf8')
    }
    else {
        error(`invalid diff value: ${diffSource}`)
        process.exit(ExitCode.Failure)
    }

    const split = file.split('\n')

    const pairs: Array<[string, string]> = []
    debug('formatting pairs')
    for (let i = 0; split.length > i; i += 2) {
        if (split[i] === split[i + 1]) continue
        pairs.push([split[i], split[i + 1]])
    }


    return pairs
}

function getFiles(path: string) {
    const files = (readdirSync(path, { recursive: true }) as string[])
        .filter((f: string) => f.endsWith(options.ext))

    debug(`found ${files.length} files`)
    if (doDebug) files.forEach(f => debug('  ' + f))

    return files.map(f => ({ file: f, txt: readFileSync(join(path, f), 'utf8') })) as Array<{ file: string, txt: string }>
}