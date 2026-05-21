# 온집 릴리즈 체크리스트

## 목적

프로덕션 배포 전후에 같은 순서로 검증해, 오래된 배포본이나 깨진 PWA asset을 놓치지 않기 위한 절차다.

## 빠른 릴리즈

```bash
npm run release:prod
```

`release:prod`는 아래 순서로 실행된다.

1. `npm run verify`
2. `npm run release:check`
3. `npm run deploy:prod`
4. `npm run smoke:prod`

## 단계별 실행

수동으로 나눠 실행해야 할 때는 아래 순서를 따른다.

```bash
npm run verify
npm run release:check
npm run deploy:prod
npm run smoke:prod
```

## 각 명령의 역할

- `npm run env:check`: `.env.example` 필수 키, 실제 값 미포함, `.env` git 제외 상태 확인
- `npm run verify`: 환경/문서/저장 키/분석 개인정보 검증, 타입 체크, 프로덕션 빌드, 로컬 스모크 QA 실행
- `npm run release:check`: 작업트리가 깨끗하고 HEAD 커밋이 있는지 확인
- `npm run deploy:prod`: Vercel 프로덕션 배포 실행
- `npm run smoke:prod`: 운영 URL의 HTML, JS/CSS asset, manifest, service worker, 아이콘, OG/SEO 파일 응답 확인

## 배포 후 확인

- `https://onzip.vercel.app` 접속 확인
- 휴대폰 홈 화면 추가 또는 기존 PWA 재실행 확인
- 기존 localStorage 데이터가 유지되는지 확인
- 필요하면 `docs/HANDOFF.md`에 배포 ID와 검증 결과 기록

## 실패 시 처리

- `verify` 실패: 코드 또는 빌드 산출물 문제이므로 배포하지 않는다.
- `release:check` 실패: 변경 사항을 커밋하거나 불필요한 변경을 정리한 뒤 다시 실행한다.
- `deploy:prod` 실패: Vercel CLI 출력과 프로젝트 설정을 확인한다.
- `smoke:prod` 실패: 운영 배포가 최신인지, alias가 갱신됐는지, asset 또는 manifest가 200 응답인지 확인한다.
