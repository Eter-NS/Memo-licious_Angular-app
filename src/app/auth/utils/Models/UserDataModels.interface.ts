export interface NoteModel {
  id: string;
  value: string;
  // getUTCTimestamp().unixtime for createdAt and deleteAt
  createdAt: number;
  deleteAt?: number;
}
export interface NoteGroupModel {
  id: string;
  title: string;
  notes: Array<NoteModel>;
  // getUTCTimestamp().unixtime for createdAt and deleteAt
  createdAt: number;
  deleteAt?: number;
}
