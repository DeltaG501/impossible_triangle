export interface CircleData {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  description: string;
}

export interface IntersectionLabel {
  text: string;
  x: number;
  y: number;
  description: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
