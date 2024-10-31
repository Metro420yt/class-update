import { debug, getInput, isDebug, setOutput } from '@actions/core'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'

var __root = import.meta.dirname.split('/').slice(0, -1).join('/')


const keys = ['ext', 'folder', 'diff'] as const
const options = Object.fromEntries(keys.map(k => [k, getInput(k)])) as Record<(typeof keys)[number], string>

run()
export async function run() {
    const pairs = await getPairs(options.diff)

    const targetFolder = process.cwd() + '/' + options.folder
    if (!existsSync(targetFolder)) throw `folder doesnt exist: ${options.folder} (${targetFolder})`
    const files = getFiles(targetFolder)

    const stats: { [key: string]: number } = {}
    for (const [oldClass, newClass] of pairs) {
        for (let i = 0; files.length > i; i++) {
            const fileName = files[i][0]
            files[i][1] = files[i][1].replaceAll(oldClass, () => {
                if (stats[fileName]) stats[fileName]++
                else stats[fileName] = 1
                return newClass
            })
        }

    }


    const total = Object.values(stats).reduce((total, num) => total += num, 0)
    setOutput('totalChanges', total)
    if (isDebug()) for (const file in stats) {
        debug(`${stats[file]} ${file}`)
    }

    files.forEach(([path, txt]) => writeFileSync(targetFolder + '/' + path, txt))
}




async function getPairs(diffSource: string): Promise<Array<[string, string]>> {
    debug('Getting diff source...')
    var file: string
    if (diffSource.startsWith('http')) {
        const resp = await fetch(diffSource)
        if (!resp.ok) throw 'bad response'
        file = await resp.text()
    }
    else if (existsSync(__root + '/' + diffSource)) file = readFileSync(__root + '/' + diffSource, 'utf8')
    else throw 'invalid diff value'

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

    return files.map(f => [f, readFileSync(path + '/' + f, 'utf8')]) as Array<[string, string]>
}