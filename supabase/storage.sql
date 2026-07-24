-- 제출서류 저장용 스토리지 버킷 (비공개, 서명된 URL로만 접근)
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', false)
on conflict (id) do nothing;

-- 업로드 경로 규칙: {tournament_id}/{user_id}/{안전한 파일명}
create policy "submissions insertable by owner"
on storage.objects for insert
with check (
  bucket_id = 'submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
);

create policy "submissions selectable by owner or admin"
on storage.objects for select
using (
  bucket_id = 'submissions'
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
);

create policy "submissions updatable by owner"
on storage.objects for update
using (
  bucket_id = 'submissions'
  and (storage.foldername(name))[2] = auth.uid()::text
);

-- Storage 키는 ASCII만 허용되어, 원본(한글 등) 파일명은 별도 컬럼에 보관
alter table public.registrations add column if not exists submitted_file_name text;
