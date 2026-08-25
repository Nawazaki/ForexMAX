import { describe, expect, it } from "vitest";
import { PreviewDatabaseRequiredRepository } from "@/lib/research-repository";

describe("PreviewDatabaseRequiredRepository", () => {
  it("blocks every write operation until an isolated Preview database is provided", async () => {
    const repository = new PreviewDatabaseRequiredRepository();
    await expect(repository.createSource()).resolves.toMatchObject({ ok: false, blocker: { code: "PREVIEW_DATABASE_REQUIRED" } });
    await expect(repository.createEvent()).resolves.toMatchObject({ ok: false, blocker: { code: "PREVIEW_DATABASE_REQUIRED" } });
    await expect(repository.addEvidence()).resolves.toMatchObject({ ok: false, blocker: { code: "PREVIEW_DATABASE_REQUIRED" } });
    await expect(repository.recordEditorialReview()).resolves.toMatchObject({ ok: false, blocker: { code: "PREVIEW_DATABASE_REQUIRED" } });
  });
});
