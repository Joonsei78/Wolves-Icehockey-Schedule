// 대회별 실제 신청자 명단 계산 (DB의 registrations 테이블 기반)
export const getRegisteredNames = (tournament, registrations) =>
  registrations.filter((r) => r.tournamentId === tournament.id).map((r) => r.playerName);

export const isRegisteredByMe = (tournamentId, registrations, userId) =>
  !!userId && registrations.some((r) => r.tournamentId === tournamentId && r.userId === userId);

export const getMyRegistration = (tournamentId, registrations, userId) =>
  userId ? registrations.find((r) => r.tournamentId === tournamentId && r.userId === userId) : undefined;

export const getTournamentRoster = (tournamentId, registrations) =>
  registrations.filter((r) => r.tournamentId === tournamentId);
