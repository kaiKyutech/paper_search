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
  year?: number;
  influentialCitationCount?: number;
  fieldsOfStudy?: string[];
  venue?: string;
  isOpenAccess?: boolean;
  referenceCount?: number;
}

export interface PaperField {
  name: string;
  score: number;
}