export class NoteResponseDto {
  id: number;
  title: string;
  content: string;
  linkUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  subjectId: number;
}
