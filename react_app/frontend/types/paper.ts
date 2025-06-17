export interface Author {
  name: string;
}

export interface Paper {
  paperId?: string;
  title: string;
  authors?: Author[];
  abstract?: string;
  url?: string;
  citationCount?: number;
  publicationDate?: string;
}

export interface PaperField {
  name: string;
  score: number;
}