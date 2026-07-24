import { supabase } from './supabaseClient';
import { DEFAULT_DOCS } from '../data/tournaments';

const mapTournament = (row) => ({
  id: row.id,
  month: row.start_date.slice(0, 7),
  title: row.title,
  location: row.location,
  ageGroup: row.age_group,
  startDate: row.start_date,
  endDate: row.end_date,
  deadline: row.deadline,
  slotsTotal: row.slots_total,
  feePerPerson: row.fee_per_person,
  description: row.description,
  status: row.status,
  docs: DEFAULT_DOCS,
  bankName: row.bank_name,
  bankAccount: row.bank_account,
  bankHolder: row.bank_holder,
});

const bankFields = (form) =>
  form.useCustomBank
    ? { bank_name: form.bankName, bank_account: form.bankAccount, bank_holder: form.bankHolder }
    : { bank_name: null, bank_account: null, bank_holder: null };

const mapRegistration = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  userId: row.user_id,
  playerName: row.player_name,
  birthYear: row.birth_year,
  jerseyNumber: row.jersey_number,
  height: row.height,
  weight: row.weight,
  position: row.position,
  hand: row.hand,
  phone: row.phone,
  paid: row.paid,
  submittedFile: row.submitted_file,
  submittedFileName: row.submitted_file_name,
});

export async function fetchTournaments() {
  const { data, error } = await supabase.from('tournaments').select('*').order('start_date');
  if (error) throw error;
  return data.map(mapTournament);
}

export async function insertTournament(form) {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      title: form.title,
      location: form.location,
      age_group: form.ageGroup,
      start_date: form.startDate,
      end_date: form.endDate,
      deadline: form.deadline,
      slots_total: Number(form.slotsTotal),
      fee_per_person: Number(form.feePerPerson),
      description: form.description,
      ...bankFields(form),
    })
    .select()
    .single();
  if (error) throw error;
  return mapTournament(data);
}

export async function updateTournament(id, form) {
  const { data, error } = await supabase
    .from('tournaments')
    .update({
      title: form.title,
      location: form.location,
      age_group: form.ageGroup,
      start_date: form.startDate,
      end_date: form.endDate,
      deadline: form.deadline,
      slots_total: Number(form.slotsTotal),
      fee_per_person: Number(form.feePerPerson),
      description: form.description,
      status: form.status,
      ...bankFields(form),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapTournament(data);
}

export async function fetchRegistrations() {
  const { data, error } = await supabase.from('registrations').select('*');
  if (error) throw error;
  return data.map(mapRegistration);
}

export async function insertRegistration(record, userId) {
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      tournament_id: record.tournamentId,
      user_id: userId,
      player_name: record.playerName,
      birth_year: record.birthYear,
      jersey_number: Number(record.jerseyNumber),
      height: Number(record.height),
      weight: Number(record.weight),
      position: record.position,
      hand: record.hand,
      phone: record.phone,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRegistration(data);
}

export async function markRegistrationPaid(tournamentId, userId) {
  const { data, error } = await supabase
    .from('registrations')
    .update({ paid: true })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapRegistration(data);
}

export async function submitRegistrationFile(tournamentId, userId, file) {
  // Storage 키는 ASCII만 허용되므로 안전한 경로를 쓰고, 원본 파일명은 별도 컬럼에 저장
  const rawExt = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
  const safeExt = rawExt.replace(/[^a-zA-Z0-9.]/g, '');
  const path = `${tournamentId}/${userId}/document${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('registrations')
    .update({ submitted_file: path, submitted_file_name: file.name })
    .eq('tournament_id', tournamentId)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapRegistration(data);
}

export async function getSubmissionDownloadUrl(path, downloadName) {
  const { data, error } = await supabase.storage
    .from('submissions')
    .createSignedUrl(path, 60, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

export async function fetchProfile(userId, fallback) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  if (data) return data;

  // 신규 가입 트리거가 아직 반영되지 않았을 때를 대비한 자동 생성
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId, name: fallback.name, email: fallback.email, role: fallback.role })
    .select()
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function updateProfile(userId, { name, phone }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ name, phone })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
