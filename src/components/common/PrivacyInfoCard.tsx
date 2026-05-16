export default function PrivacyInfoCard() {
  return (
    <section className="oz-card p-4">
      <p className="text-base font-semibold text-[#222222]">개인정보와 데이터 안내</p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-[#6a6a6a]">
        <p>
          온집은 회원가입을 받지 않고, 입력한 생활 데이터는 서버로 전송하지 않습니다.
          일정, 금액, 장보기, 기록은 이 기기의 브라우저 저장소에만 저장됩니다.
        </p>
        <p>
          방문 수와 기능 사용 흐름을 보기 위해 GA4와 Vercel Analytics를 사용합니다.
          분석에는 제목, 금액, 메모, 태그, 구성원 이름을 보내지 않습니다.
        </p>
        <p>
          문의는 <a href="mailto:holyyomi@naver.com" className="font-semibold text-[#ff385c]">holyyomi@naver.com</a> 으로 보내주세요.
        </p>
      </div>
    </section>
  )
}
