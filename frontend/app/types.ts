export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  type: string;
  company: string;
  salary: string;
  level: string;
  is_hot: boolean;
  deadline: string;
  created_at?: string;
}

export interface Application {
  id: string;
  job_id: number;
  full_name: string;
  email: string;
  submitted_at: string;
  status: string;
  job_title: string;
  job_company: string;
  cv_url?: string;
}
