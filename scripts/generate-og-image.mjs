// 공유 미리보기용 OG 이미지 생성
// 실행: node scripts/generate-og-image.mjs
// 의존: canvas

import { createCanvas, loadImage } from 'canvas'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const logoPath = join(__dirname, '..', 'assets', 'brand', 'onzip-logo.png')
const outputPath = join(publicDir, 'og-image.png')

const width = 1200
const height = 630

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawFeature(ctx, x, y, label) {
  drawRoundedRect(ctx, x, y, 138, 48, 24)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = '#ebebeb'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#222222'
  ctx.font = '600 22px "Malgun Gothic", "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + 69, y + 25)
}

async function main() {
  mkdirSync(publicDir, { recursive: true })

  const logo = await loadImage(readFileSync(logoPath))
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#f7f7f7'
  ctx.fillRect(0, 0, width, height)

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#fff7f8')
  gradient.addColorStop(0.58, '#ffffff')
  gradient.addColorStop(1, '#f2f2f2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  drawRoundedRect(ctx, 92, 92, 1016, 446, 44)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = '#ebebeb'
  ctx.lineWidth = 2
  ctx.stroke()

  drawRoundedRect(ctx, 142, 146, 146, 146, 38)
  ctx.fillStyle = '#f7f7f7'
  ctx.fill()
  ctx.drawImage(logo, 154, 158, 122, 122)

  ctx.fillStyle = '#222222'
  ctx.font = '700 86px "Malgun Gothic", "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('온집', 330, 220)

  ctx.fillStyle = '#ff385c'
  ctx.font = '700 30px "Malgun Gothic", "Segoe UI", Arial, sans-serif'
  ctx.fillText('우리 집 생활을 한곳에', 334, 270)

  ctx.fillStyle = '#3f3f3f'
  ctx.font = '400 34px "Malgun Gothic", "Segoe UI", Arial, sans-serif'
  ctx.fillText('가계부, 일정, 체크리스트, 보관 메모를', 142, 374)
  ctx.fillText('휴대폰에 설치해서 가볍게 관리하세요.', 142, 420)

  drawFeature(ctx, 142, 470, '가계부')
  drawFeature(ctx, 296, 470, '일정')
  drawFeature(ctx, 450, 470, '체크리스트')
  drawFeature(ctx, 604, 470, '금고')

  ctx.fillStyle = '#6a6a6a'
  ctx.font = '500 22px "Malgun Gothic", "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('onzip.vercel.app', 1042, 172)

  writeFileSync(outputPath, canvas.toBuffer('image/png'))
  console.log(`OG 이미지 생성 완료: ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
