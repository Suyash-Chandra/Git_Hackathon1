// TypeScript interfaces for the Git Music application

export interface IdeaVersion {
  id: number;
  display_version?: string;
  parent_version_id: number | null;
  file_path: string;
  duration: number | null;
  bpm: number | null;
  key_signature: string | null;
  mood: string | null;
  genre: string | null;
  energy_level: string | null;
  instruments: string[];
  tags: string[];
  notes: string | null;
  created_at: string;
}

export interface Idea {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  version_count?: number;
  latest_version?: IdeaVersion | null;
  versions?: IdeaVersion[];
}

export interface IdeasListResponse {
  items: Idea[];
  total: number;
}

export interface CaptureResponse {
  id: number;
  title: string;
  version_id: number;
  display_version?: string;
  file_path: string;
  bpm: number | null;
  key_signature: string | null;
  mood: string | null;
  genre: string | null;
  energy_level: string | null;
  instruments: string[];
  tags: string[];
  duration: number | null;
  created_at: string;
}

export interface SearchResult {
  idea_id: number;
  version_id: number;
  title: string;
  bpm: number | null;
  key_signature: string | null;
  mood: string | null;
  genre: string | null;
  energy_level: string | null;
  instruments: string[];
  tags: string[];
  duration: number | null;
  file_path: string;
  created_at: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  tags_used: string[];
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    versionId: number;
    displayVersion?: string;
    mood: string | null;
    genre: string | null;
    bpm: number | null;
    key_signature: string | null;
    tags: string[];
    created_at: string;
    duration: number | null;
    file_path: string;
    is_root: boolean;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
}

export interface GraphResponse {
  idea_title: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Stats {
  total_ideas: number;
  total_versions: number;
  moods: Record<string, number>;
  genres: Record<string, number>;
}

export interface ActivityItem {
  date: string;
  count: number;
}

export interface ActivityResponse {
  days: number;
  items: ActivityItem[];
}
