import { getResearchControlSnapshot, previewDatabaseBlocker, type ResearchControlSnapshot } from "@/lib/research-control";

export type ResearchWriteResult = { ok: true; id: string } | { ok: false; blocker: typeof previewDatabaseBlocker };

export interface ResearchRepository {
  getControlSnapshot(): Promise<ResearchControlSnapshot>;
  createSource(): Promise<ResearchWriteResult>;
  createEvent(): Promise<ResearchWriteResult>;
  addEvidence(): Promise<ResearchWriteResult>;
  recordEditorialReview(): Promise<ResearchWriteResult>;
}

/**
 * Safe default implementation. Replace only after an isolated Preview database
 * is configured and a repository implementation is covered by DB integration tests.
 */
export class PreviewDatabaseRequiredRepository implements ResearchRepository {
  async getControlSnapshot() {
    return getResearchControlSnapshot();
  }

  async createSource(): Promise<ResearchWriteResult> { return { ok: false, blocker: previewDatabaseBlocker }; }
  async createEvent(): Promise<ResearchWriteResult> { return { ok: false, blocker: previewDatabaseBlocker }; }
  async addEvidence(): Promise<ResearchWriteResult> { return { ok: false, blocker: previewDatabaseBlocker }; }
  async recordEditorialReview(): Promise<ResearchWriteResult> { return { ok: false, blocker: previewDatabaseBlocker }; }
}

export const researchRepository: ResearchRepository = new PreviewDatabaseRequiredRepository();
