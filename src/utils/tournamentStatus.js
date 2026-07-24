// 대회 모집 상태 계산: DB status(open/closed/upcoming) + 정원 마감 여부를 하나로 정리
export function getStatusInfo(tournament, filledCount) {
  if (tournament.status === 'upcoming') {
    return { key: 'upcoming', label: '예정', canRegister: false };
  }
  if (tournament.status === 'closed' || filledCount >= tournament.slotsTotal) {
    return { key: 'closed', label: '마감', canRegister: false };
  }
  return { key: 'open', label: '모집중', canRegister: true };
}
