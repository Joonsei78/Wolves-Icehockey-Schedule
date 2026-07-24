// 팀 공용 입금 계좌 — 대회별로 커스텀 계좌를 지정하지 않으면 이 기본 계좌 사용
export const BANK_INFO = {
  bankName: '하나은행',
  bankAccount: '21891041935107',
  bankHolder: '김덕준',
};

// 대회별 서류함 — 실제 파일은 데모용 placeholder (public/docs)
export const DEFAULT_DOCS = [
  { key: 'notice', label: '대회 개최공문', filename: '대회_개최공문.txt', url: '/docs/notice.txt' },
  { key: 'guideline', label: '대회 요강', filename: '대회_요강.txt', url: '/docs/guideline.txt' },
  { key: 'formTemplate', label: '제출서류 양식', filename: '제출서류_양식.txt', url: '/docs/form-template.txt' },
];

export const ageGroups = ['전체', 'U8', 'U9', 'U10', 'U11', 'U12', '저학년', '고학년'];
