import { QuestionType } from 'models/enums/QuestionType.enum';
import { SkillType } from 'models/enums/skillType.enum';

export interface QuestionSet {
  identifier: string;
  title: Description;
  description: Description;
  repository: Repository;
  questions: Question[];
  sequence: number;
  tenant: string;
  taxonomy: Taxonomy;
  sub_skills: SubSkill[];
  purpose: string;
  is_atomic: boolean;
  gradient: string;
  group_name: number;
  content_ids: string[];
  instruction_text: string;
  status: string;
  is_active: boolean;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Description {
  en: string;
}

export interface Repository {
  id: number;
  name: Description;
}

export interface SubSkill {
  id: number;
  name: Name;
}

export interface Name {
  en: string;
  hi: string;
  kn: string;
}

export interface Taxonomy {
  board: SubSkill;
  class: SubSkill;
  l1_skill: Skill;
  l2_skill: Skill[];
  l3_skill: null[];
}

export interface Skill {
  id: number;
  name: Name;
  type: SkillType;
}
export interface Question {
  identifier: string;
  benchmark_time: number;
  question_type: string;
  questionType?: QuestionType;
  operation: string;
  name: Description;
  description: Description;
  tenant: string;
  repository: Repository;
  taxonomy: Taxonomy;
  gradient: string;
  hints: string;
  status: string;
  media: any[];
  question_body: QuestionBody;
  sub_skills: Array<SubSkill | null>;
  created_by: string;
  updated_by: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface QuestionBody {
  answers?: Answers;
  numbers: Numbers;
  wrong_answer: WrongAnswer[];
  options?: string[];
  correct_option?: string;
}

interface Answers {
  result: number;
  isPrefil: boolean;
  answerTop: string;
  answerResult: string;
}

interface WrongAnswer {
  value: number[];
  subskillname: Subskillname;
}

enum Subskillname {
  Carry = 'carry',
  XPlus0 = 'x_plus_0',
}

interface Numbers {
  [key: string]: string | null;
}
