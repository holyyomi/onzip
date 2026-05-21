# 온집 개발 운영 규칙

## 1. 작업 시작 전
- `docs/HANDOFF.md` 확인
- `docs/TASK_LIST.md`에서 현재 TASK 확인
- 관련 화면/데이터 모델 확인

## 2. 작업 중
- 하나의 TASK만 처리
- 기능 추가 후 관련 테스트 또는 수동 검증 수행
- 변경한 파일을 HANDOFF에 기록

## 3. 작업 완료 후
```bash
npm run env:check
npm run docs:check
npm run storage:check
npm run backup:check
npm run analytics:check
npm run typecheck
npm run build
npm run smoke
npm run smoke:prod
npm run verify
npm run release:check
npm run ops:check
npm run release:prod
# 주요 화면 수동 확인 (npm run dev)
# docs/HANDOFF.md 업데이트
git status
```

프로덕션 배포는 `docs/RELEASE.md`의 순서를 따른다.
GitHub 연결과 CI 확인은 `docs/GITHUB_CI.md`의 순서를 따른다.
GitHub remote 연결 후에는 `npm run github:check`로 origin/upstream 상태를 확인한다.

## 4. 커밋 메시지 규칙
```
Add calendar monthly view
Implement fixed expense form
Wire money summary cards
Add shopping list feature
```
동사로 시작, 영어, 50자 이내.

## 5. 금지사항
- 한 번에 여러 Phase 건드리기 금지
- 화면부터 과하게 꾸미기 금지
- 가족공유/서버 동기화는 현재 범위에서 제외
- 자동 카드/은행 연동 먼저 시작 금지
- MVP 외 기능 먼저 넣기 금지

## 6. 브랜치 전략 (선택)
- main: 안정 버전
- feature/TASK-XXX: 각 TASK 작업 브랜치
