export interface Story {
  id: string;
  title: string;
  date: string;
  content: string;
  audioDuration: string;
  aiTags: string[];
}

export interface Resident {
  id: string;
  name: string;
  nickname: string;
  age: number;
  roomNumber: string;
  admissionDate: string;
  coverTitle: string;
  coverColor: 'emerald' | 'burgundy' | 'sapphire' | 'amber';
  stories: Story[];
  _lifeBookId?: string;
}
