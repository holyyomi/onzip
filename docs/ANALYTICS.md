# 온집 분석 설정

## 목적

온집은 로컬 저장 앱이므로 사용자가 입력한 내용은 서버로 보내지 않는다.
분석은 방문 수와 익명 행동 이벤트만 확인한다.

수집하지 않는 것:
- 지출 금액
- 일정/기록/장보기 제목
- 메모 내용
- 태그
- 구성원 이름

수집하는 것:
- 앱 열림
- 탭 열림
- 빠른 추가 열림/선택/저장
- 주요 저장 완료 이벤트
- 앱 설치 버튼 클릭/설치 결과
- 로컬 저장 안내 닫기

## 방문 분석

Vercel Web Analytics를 사용한다.

- 패키지: `@vercel/analytics`
- 위치: `src/app/App.tsx`
- Vercel 대시보드의 Analytics 화면에서 방문 수, 페이지뷰, 기기/브라우저 흐름을 확인한다.
- Hobby 플랜은 Web Analytics 이벤트 50,000개/월 범위에서 무료다.

## 이벤트 분석

GA4를 사용한다. Vercel의 Custom Events는 Pro 이상에서 제공되므로 무료 단계에서는 GA4가 현실적이다.

환경변수:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

설정 위치:
- 로컬: `.env`
- Vercel: Project Settings → Environment Variables

환경변수를 추가하거나 바꾸면 다시 배포해야 한다.
측정 ID는 코드에 직접 쓰지 않고 Vercel 환경변수에서만 관리한다.

현재 Production/Preview 환경변수:

```text
VITE_GA_MEASUREMENT_ID=G-3206HZH0BS
```

## 이벤트 목록

| 이벤트 | 의미 |
|---|---|
| `app_open` | 앱 첫 실행 |
| `tab_open` | 탭 진입 |
| `quick_add_open` | 빠른 추가 메뉴 열림 |
| `quick_add_select` | 빠른 추가 항목 선택 |
| `quick_add_saved` | 빠른 추가 저장 완료 |
| `ledger_saved` | 가계부 저장 완료 |
| `calendar_event_saved` | 일정 저장 완료 |
| `shopping_saved` | 장보기 저장 완료 |
| `checklist_saved` | 체크리스트 저장 완료 |
| `fixed_expense_saved` | 고정지출 저장 완료 |
| `subscription_saved` | 구독 저장 완료 |
| `record_saved` | 기록 저장 완료 |
| `supply_saved` | 생활용품 저장 완료 |
| `supply_status_changed` | 생활용품 상태 변경 |
| `supply_sent_to_shopping` | 생활용품을 장보기로 추가 |
| `template_copied` | 템플릿 복사 |
| `install_cta_click` | 앱 설치 버튼 클릭 |
| `install_prompt_available` | 브라우저 설치 프롬프트 사용 가능 |
| `install_prompt_result` | 설치 프롬프트 결과 |
| `install_success` | 앱 설치 완료 |
| `install_guide_open` | 수동 설치 안내 열림 |
| `install_card_hide` | 설치 카드 닫기 |
| `storage_notice_dismiss` | 로컬 저장 안내 닫기 |

## 유료 전환 판단

Vercel 사용량은 비용 위험을 보는 지표이고, GA4는 실제 사용 흐름을 보는 지표다.

검토 기준:
- 월 활성 사용자 300~500명 근접
- 월 방문/앱 실행이 꾸준히 증가
- 빠른 추가 저장 이벤트가 반복적으로 발생
- Vercel 무료 사용량 50~70% 이상 사용
- 모르는 사용자 유입이 생김
