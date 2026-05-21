# 온집 GitHub CI 연결

> 목적: 로컬에서 통과한 `npm run verify`가 GitHub push/PR에서도 자동으로 실행되게 한다.

## 현재 상태

- CI 파일: `.github/workflows/verify.yml`
- 실행 조건: `main`, `master` push와 모든 pull request
- 실행 내용: Node 20, `npm ci`, `npm run verify`
- 현재 로컬 저장소에는 git remote가 없다.

## 연결 전 확인

```bash
git status
npm run verify
npm run github:check
```

- 작업트리가 깨끗해야 한다.
- `npm run verify`가 통과해야 한다.
- remote 연결 전에는 `npm run github:check`가 `origin remote is not configured`로 실패하는 것이 정상이다.
- `.env`, `.env.local`은 GitHub에 올리지 않는다.

## GitHub 저장소 연결

GitHub에서 빈 저장소를 만든 뒤 아래 중 하나를 실행한다.

```bash
git remote add origin https://github.com/{OWNER}/{REPO}.git
git push -u origin master
```

기본 브랜치를 `main`으로 쓰려면 아래처럼 바꾼다.

```bash
git branch -M main
git remote add origin https://github.com/{OWNER}/{REPO}.git
git push -u origin main
```

## 첫 push 후 확인

- GitHub 저장소의 `Actions` 탭을 연다.
- `Verify` 워크플로가 실행되는지 확인한다.
- 초록 체크가 뜨면 push/PR 검증 연결은 완료다.
- 실패하면 실패한 step의 로그를 보고 로컬에서 같은 명령을 다시 실행한다.
- 로컬에서는 `npm run github:check`로 `origin`과 upstream 설정을 확인한다.

## 실패 처리

| 실패 지점 | 확인할 것 |
|---|---|
| `npm ci` | `package-lock.json`이 최신인지 확인 |
| `npm run env:check` | `.env.example`, `.gitignore`, 추적 중인 env 파일 확인 |
| `npm run docs:check` | 문서에 적힌 파일 경로와 npm script 이름 확인 |
| `npm run storage:check` | 소스 localStorage 키와 HANDOFF 문서 목록 일치 확인 |
| `npm run backup:check` | 백업 내보내기/불러오기 data 키 일치 확인 |
| `npm run analytics:check` | Analytics 이벤트명과 파라미터 개인정보 기준 확인 |
| `npm run github:check` | GitHub remote와 현재 브랜치 upstream 설정 확인 |
| `npm run typecheck` | TypeScript 오류 수정 |
| `npm run build` | Vite 빌드 오류와 asset 경로 확인 |
| `npm run smoke` | PWA manifest, 아이콘, OG/SEO 파일 확인 |

## 운영 규칙

- GitHub에는 API key, Supabase key, Vercel token을 커밋하지 않는다.
- 프로덕션 배포는 GitHub Actions가 아니라 기존 `npm run release:prod` 흐름으로 진행한다.
- 배포 자동화가 필요해지면 별도 작업으로 Vercel 프로젝트 연결과 secret 설정을 분리해서 진행한다.
