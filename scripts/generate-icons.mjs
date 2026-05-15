// 아이콘 PNG 자동 생성 스크립트
// 실행: node scripts/generate-icons.mjs
// 의존: sharp (npm install -D sharp) 또는 브라우저 Canvas 사용

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')

mkdirSync(iconsDir, { recursive: true })

function generateIcon(size, maskable = false) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const radius = maskable ? 0 : size * 0.19  // maskable = full bleed, regular = rounded

  // 배경
  ctx.fillStyle = '#3B82F6'
  if (maskable) {
    ctx.fillRect(0, 0, size, size)
  } else {
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, radius)
    ctx.fill()
  }

  // 텍스트 "온"
  const fontSize = size * 0.55
  ctx.font = `bold ${fontSize}px "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('온', size / 2, size / 2 + fontSize * 0.05)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync(join(iconsDir, 'icon-192.png'), generateIcon(192))
  writeFileSync(join(iconsDir, 'icon-512.png'), generateIcon(512))
  writeFileSync(join(iconsDir, 'icon-512-maskable.png'), generateIcon(512, true))
  console.log('✅ 아이콘 생성 완료: public/icons/icon-192.png, icon-512.png, icon-512-maskable.png')
} catch (e) {
  console.log('⚠️  canvas 패키지가 없습니다. 다음 중 하나를 실행하세요:')
  console.log('   npm install -D canvas  (권장)')
  console.log('   또는 https://realfavicongenerator.net 에서 icon.svg로 PNG 생성')
}
