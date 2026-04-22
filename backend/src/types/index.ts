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
  created_at?: Date;
}

export interface Application {
  id: string;
  job_id: number;
  full_name: string;
  email: string;
  phone?: string;
  experience_summary?: string;
  cv_s3_key: string;
  ai_analysis?: any;
  status: 'Pending' | 'Reviewing' | 'Accepted' | 'Rejected';
  submitted_at: Date;
}

export interface ApplicationWithJob extends Application {
  job_title: string;
  job_company: string;
}
