import { generateDailyReport } from "../../src/reporters/daily";

describe("Daily Reporter", () => {
  test("should generate daily report", async () => {
    const report = await generateDailyReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe("string");
    expect(report).toContain("Git Commit Report");
  });
});
