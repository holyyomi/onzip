// 아이콘 PNG 자동 생성 스크립트
// 실행: node scripts/generate-icons.mjs
// 의존: canvas

import { createCanvas, loadImage } from 'canvas'
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')
const logoPath = join(__dirname, '..', 'assets', 'brand', 'onzip-logo.png')

mkdirSync(iconsDir, { recursive: true })

async function generateIcon(size, maskable = false) {
  const logo = await loadImage(readFileSync(logoPath))
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  if (maskable) {
    ctx.fillStyle = '#f7f7f7'
    ctx.fillRect(0, 0, size, size)
  }

  const padding = maskable ? size * 0.1 : size * 0.04
  const drawSize = size - padding * 2
  ctx.drawImage(logo, padding, padding, drawSize, drawSize)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync(join(iconsDir, 'icon-192.png'), await generateIcon(192))
  writeFileSync(join(iconsDir, 'icon-512.png'), await generateIcon(512))
  writeFileSync(join(iconsDir, 'icon-512-maskable.png'), await generateIcon(512, true))
  console.log('✅ 아이콘 생성 완료: public/icons/icon-192.png, icon-512.png, icon-512-maskable.png')
} catch (e) {
  console.log('⚠️  아이콘 생성 실패:', e)
}
