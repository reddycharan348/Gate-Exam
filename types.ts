
export enum Difficulty {
  EASY = 'Easy',
  MODERATE = 'Moderate',
  DIFFICULT = 'Difficult'
}

export enum TestType {
  FULL = 'Full Length Mock',
  APTITUDE = 'Aptitude Only'
}

export enum QuestionType {
  MCQ = 'MCQ',
  MSQ = 'MSQ',
  NAT = 'NAT'
}

export enum QuestionStatus {
  NOT_VISITED = 'NOT_VISITED',
  NOT_ANSWERED = 'NOT_ANSWERED',
  ANSWERED = 'ANSWERED',
  MARKED_FOR_REVIEW = 'MARKED_FOR_REVIEW',
  MARKED_AND_ANSWERED = 'MARKED_AND_ANSWERED'
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  marks: number;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  section: string;
}

export interface UserAnswer {
  questionId: number;
  answer: string | string[];
  status: QuestionStatus;
}

export interface Analysis {
  score: number;
  totalPossible: number;
  accuracy: number;
  sectionPerformance: {
    section: string;
    score: number;
    total: number;
    feedback: string;
  }[];
  improvementAreas: string[];
}
