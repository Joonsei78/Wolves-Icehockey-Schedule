// 팀 공용 입금 계좌 — 대회별로 계좌를 따로 쓰지 않는 한 공통으로 사용
export const BANK_INFO = {
  bankName: '국민은행',
  bankAccount: '123456-04-789012',
  bankHolder: 'Wolves Icehockey Club',
};

// 대회별 서류함 — 실제 파일은 데모용 placeholder (public/docs)
export const DEFAULT_DOCS = [
  { key: 'notice', label: '대회 개최공문', filename: '대회_개최공문.txt', url: '/docs/notice.txt' },
  { key: 'guideline', label: '대회 요강', filename: '대회_요강.txt', url: '/docs/guideline.txt' },
  { key: 'formTemplate', label: '제출서류 양식', filename: '제출서류_양식.txt', url: '/docs/form-template.txt' },
];

export const ageGroups = ['전체', 'U8', 'U10', 'U12', 'U14', 'U16'];
