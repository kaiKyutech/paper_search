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
  openAccessPdf?: {
    url: string;
    status: string;
  } | null;
}

export interface PaperField {
  name: string;
  score: number;
}