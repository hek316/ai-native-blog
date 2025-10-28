import fs from 'fs'
import path from 'path'

type Author = {
  name: string
  bio: string
  avatarUrl: string
}

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  author?: Author
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}
  let currentKey: string | null = null
  let currentObject: any = null

  frontMatterLines.forEach((line) => {
    // Check if this is a nested property (starts with spaces)
    if (line.match(/^\s+\w+:/)) {
      let colonIndex = line.indexOf(':')
      let nestedKey = line.substring(0, colonIndex).trim()
      let nestedValue = line.substring(colonIndex + 1).trim()
      nestedValue = nestedValue.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
      if (currentObject) {
        currentObject[nestedKey] = nestedValue
      }
    } else {
      // This is a top-level property
      let colonIndex = line.indexOf(':')
      if (colonIndex === -1) return

      let key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()

      if (value === '') {
        // This might be an object property (like author:)
        currentKey = key
        currentObject = {}
        metadata[currentKey as keyof Metadata] = currentObject as any
      } else {
        // Simple string property
        value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
        metadata[key as keyof Metadata] = value as any
        currentKey = null
        currentObject = null
      }
    }
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
