-- 대회 상태에 '예정'(upcoming) 추가
alter table public.tournaments drop constraint if exists tournaments_status_check;
alter table public.tournaments add constraint tournaments_status_check
  check (status in ('open', 'closed', 'upcoming'));
