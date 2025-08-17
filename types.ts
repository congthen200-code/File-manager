
export interface FileEntry {
  id: string;
  name: string;
  path: string;
  description: string;
  installationNotes: string;
  imageUrl: string;
  password?: string;
  tags: string[];
}
