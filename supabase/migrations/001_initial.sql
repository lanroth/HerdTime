-- HerdTime initial schema
-- Run this in the Supabase SQL editor or via supabase db push

-- Enable uuid extension (available by default in Supabase)
create extension if not exists "pgcrypto";

-- =========================================================
-- Tables
-- =========================================================

create table if not exists polls (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  creator_id   uuid references auth.users(id) on delete set null,
  admin_token  uuid not null default gen_random_uuid(),
  deadline     date,
  created_at   timestamptz not null default now()
);

create table if not exists poll_dates (
  id       uuid primary key default gen_random_uuid(),
  poll_id  uuid not null references polls(id) on delete cascade,
  date     date not null,
  unique (poll_id, date)
);

create table if not exists participants (
  id           uuid primary key default gen_random_uuid(),
  poll_id      uuid not null references polls(id) on delete cascade,
  name         text not null,
  voter_id     uuid references auth.users(id) on delete set null,
  voter_token  uuid not null default gen_random_uuid(),
  comment      text,
  created_at   timestamptz not null default now()
);

create table if not exists votes (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade,
  poll_date_id    uuid not null references poll_dates(id) on delete cascade,
  status          text not null check (status in ('yes', 'no', 'maybe')),
  unique (participant_id, poll_date_id)
);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table polls         enable row level security;
alter table poll_dates    enable row level security;
alter table participants  enable row level security;
alter table votes         enable row level security;

-- polls: anyone can read and create; only creator or admin can update/delete
create policy "polls_select"  on polls for select  using (true);
create policy "polls_insert"  on polls for insert  with check (true);
create policy "polls_update"  on polls for update  using (
  creator_id = auth.uid()
);
create policy "polls_delete"  on polls for delete  using (
  creator_id = auth.uid()
);

-- poll_dates: anyone can read and create; only poll creator can delete
create policy "poll_dates_select"  on poll_dates for select  using (true);
create policy "poll_dates_insert"  on poll_dates for insert  with check (true);
create policy "poll_dates_delete"  on poll_dates for delete  using (
  exists (
    select 1 from polls
    where polls.id = poll_dates.poll_id
      and polls.creator_id = auth.uid()
  )
);

-- participants: anyone can read and create; only the voter can update/delete
create policy "participants_select"  on participants for select  using (true);
create policy "participants_insert"  on participants for insert  with check (true);
create policy "participants_update"  on participants for update  using (
  voter_id = auth.uid()
);
create policy "participants_delete"  on participants for delete  using (
  voter_id = auth.uid()
  or exists (
    select 1 from polls
    where polls.id = participants.poll_id
      and polls.creator_id = auth.uid()
  )
);

-- votes: anyone can read and create; only the voter can update/delete
create policy "votes_select"  on votes for select  using (true);
create policy "votes_insert"  on votes for insert  with check (true);
create policy "votes_update"  on votes for update  using (
  exists (
    select 1 from participants
    where participants.id = votes.participant_id
      and participants.voter_id = auth.uid()
  )
);
create policy "votes_delete"  on votes for delete  using (
  exists (
    select 1 from participants
    where participants.id = votes.participant_id
      and participants.voter_id = auth.uid()
  )
);

-- =========================================================
-- Admin RPC — update poll bypassing RLS (for admin_token flow)
-- Called from the client with the admin_token; Supabase verifies it.
-- =========================================================

create or replace function update_poll_as_admin(
  p_poll_id    uuid,
  p_admin_token uuid,
  p_title      text default null,
  p_description text default null,
  p_deadline   date default null
)
returns void
language plpgsql
security definer
as $$
begin
  update polls
  set
    title       = coalesce(p_title,       title),
    description = coalesce(p_description, description),
    deadline    = coalesce(p_deadline,    deadline)
  where id = p_poll_id
    and admin_token = p_admin_token;
end;
$$;

create or replace function delete_poll_as_admin(
  p_poll_id     uuid,
  p_admin_token uuid
)
returns void
language plpgsql
security definer
as $$
begin
  delete from polls
  where id = p_poll_id
    and admin_token = p_admin_token;
end;
$$;

create or replace function add_poll_date_as_admin(
  p_poll_id     uuid,
  p_admin_token uuid,
  p_date        date
)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from polls where id = p_poll_id and admin_token = p_admin_token
  ) then
    raise exception 'Invalid admin token';
  end if;
  insert into poll_dates (poll_id, date) values (p_poll_id, p_date)
  on conflict do nothing;
end;
$$;

create or replace function remove_poll_date_as_admin(
  p_poll_id     uuid,
  p_admin_token uuid,
  p_date_id     uuid
)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from polls where id = p_poll_id and admin_token = p_admin_token
  ) then
    raise exception 'Invalid admin token';
  end if;
  delete from poll_dates where id = p_date_id and poll_id = p_poll_id;
end;
$$;

-- Participant update via voter_token (for anonymous return-edit)
create or replace function update_participant_as_voter(
  p_participant_id uuid,
  p_voter_token    uuid,
  p_name           text default null,
  p_comment        text default null
)
returns void
language plpgsql
security definer
as $$
begin
  update participants
  set
    name    = coalesce(p_name,    name),
    comment = coalesce(p_comment, comment)
  where id = p_participant_id
    and voter_token = p_voter_token;
end;
$$;

create or replace function upsert_vote_as_voter(
  p_participant_id uuid,
  p_voter_token    uuid,
  p_poll_date_id   uuid,
  p_status         text
)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from participants
    where id = p_participant_id and voter_token = p_voter_token
  ) then
    raise exception 'Invalid voter token';
  end if;
  insert into votes (participant_id, poll_date_id, status)
  values (p_participant_id, p_poll_date_id, p_status)
  on conflict (participant_id, poll_date_id)
  do update set status = excluded.status;
end;
$$;
