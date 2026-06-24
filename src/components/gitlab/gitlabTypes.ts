export interface ProjectInfo {
  status: "connected" | "offline";
  projectName: string;
  description: string;
  webUrl: string;
  starCount: number;
  owner: string;
  path: string;
}

export interface PipelineInfo {
  id: number;
  status: string;
  ref: string;
  sha: string;
  commitMessage: string;
  webUrl: string;
  createdAt: string;
}
