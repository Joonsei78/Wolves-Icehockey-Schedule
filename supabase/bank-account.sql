-- 대회별 커스텀 입금 계좌 (비어있으면 팀 기본 계좌 사용)
alter table public.tournaments add column if not exists bank_name text;
alter table public.tournaments add column if not exists bank_account text;
alter table public.tournaments add column if not exists bank_holder text;
