-- Company Projects
CREATE TABLE IF NOT EXISTS company_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'construction',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','ongoing','completed','on_hold')),
  location TEXT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  budget NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE company_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owns projects" ON company_projects FOR ALL TO authenticated
  USING (auth.uid() = company_id);
CREATE POLICY "Anyone can view projects" ON company_projects FOR SELECT TO authenticated
  USING (true);

-- Company Jobs
CREATE TABLE IF NOT EXISTS company_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT DEFAULT 'full-time' CHECK (type IN ('full-time','part-time','contract','internship')),
  salary_range TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE company_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owns jobs" ON company_jobs FOR ALL TO authenticated
  USING (auth.uid() = company_id);
CREATE POLICY "Anyone can view jobs" ON company_jobs FOR SELECT TO authenticated
  USING (true);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES company_jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','shortlisted','rejected','accepted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_job_applicant UNIQUE (job_id, applicant_id)
);
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicant owns applications" ON job_applications FOR ALL TO authenticated
  USING (auth.uid() = applicant_id);
CREATE POLICY "Company can view applications" ON job_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_jobs WHERE id = job_id AND company_id = auth.uid()));

-- Company Events & Tenders
CREATE TABLE IF NOT EXISTS company_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'event' CHECK (event_type IN ('event','tender','competition','rfp')),
  location TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_deadline TIMESTAMPTZ,
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE company_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owns events" ON company_events FOR ALL TO authenticated
  USING (auth.uid() = company_id);
CREATE POLICY "Anyone can view events" ON company_events FOR SELECT TO authenticated
  USING (true);

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES company_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_event_user UNIQUE (event_id, user_id)
);
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own registrations" ON event_registrations FOR ALL TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Company can view registrations" ON event_registrations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM company_events WHERE id = event_id AND company_id = auth.uid()));

-- Company Team Members
CREATE TABLE IF NOT EXISTS company_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin','manager','member','viewer')),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','invited','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_company_member UNIQUE (company_id, user_id)
);
ALTER TABLE company_team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company manages team" ON company_team_members FOR ALL TO authenticated
  USING (auth.uid() = company_id OR auth.uid() = user_id);
CREATE POLICY "Members can view team" ON company_team_members FOR SELECT TO authenticated
  USING (true);
