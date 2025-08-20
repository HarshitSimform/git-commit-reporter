import {
  categorizeCommit,
  aggregateCommitsByCategory,
} from "../../src/utils/categories";
import { GitCommit } from "../../src/types";

describe("Commit Categories", () => {
  describe("categorizeCommit", () => {
    test("should categorize feature commits", () => {
      expect(categorizeCommit("feat: add login API")).toBe("Feature");
      expect(categorizeCommit("feature: implement user dashboard")).toBe(
        "Feature"
      );
      expect(categorizeCommit("FEAT: Add new component")).toBe("Feature");
      expect(categorizeCommit("feat add login without colon")).toBe("Feature");
      expect(categorizeCommit("feature implement dashboard")).toBe("Feature");
    });

    test("should categorize fix commits", () => {
      expect(categorizeCommit("fix: resolve payment bug")).toBe("Fix");
      expect(categorizeCommit("bugfix: handle null pointer")).toBe("Fix");
      expect(categorizeCommit("FIX: Memory leak issue")).toBe("Fix");
      expect(categorizeCommit("fix resolve payment bug")).toBe("Fix");
      expect(categorizeCommit("bugfix handle null pointer")).toBe("Fix");
    });

    test("should categorize docs commits", () => {
      expect(categorizeCommit("docs: update README")).toBe("Docs");
      expect(categorizeCommit("doc: add API documentation")).toBe("Docs");
      expect(categorizeCommit("docs update README")).toBe("Docs");
      expect(categorizeCommit("doc add API documentation")).toBe("Docs");
    });

    test("should categorize refactor commits", () => {
      expect(categorizeCommit("refactor: optimize query")).toBe("Refactor");
      expect(categorizeCommit("refact: clean up code")).toBe("Refactor");
      expect(categorizeCommit("refactor optimize query")).toBe("Refactor");
      expect(categorizeCommit("refact clean up code")).toBe("Refactor");
    });

    test("should categorize other commit types", () => {
      expect(categorizeCommit("style: fix formatting")).toBe("Style");
      expect(categorizeCommit("test: add unit tests")).toBe("Test");
      expect(categorizeCommit("chore: update dependencies")).toBe("Chore");
      expect(categorizeCommit("perf: improve performance")).toBe("Performance");
      expect(categorizeCommit("update: upgrade dependencies")).toBe("Update");
      expect(categorizeCommit("upd: modify configuration")).toBe("Update");
      // Test without colons
      expect(categorizeCommit("style fix formatting")).toBe("Style");
      expect(categorizeCommit("test add unit tests")).toBe("Test");
      expect(categorizeCommit("chore update dependencies")).toBe("Chore");
      expect(categorizeCommit("perf improve performance")).toBe("Performance");
      expect(categorizeCommit("update upgrade dependencies")).toBe("Update");
      expect(categorizeCommit("upd modify configuration")).toBe("Update");
    });

    test("should categorize uncategorized commits as Other", () => {
      expect(categorizeCommit("random commit message")).toBe("Other");
      expect(categorizeCommit("updated files")).toBe("Other");
    });
  });

  describe("aggregateCommitsByCategory", () => {
    test("should aggregate commits by category", () => {
      const mockCommits: GitCommit[] = [
        {
          hash: "1",
          date: new Date(),
          message: "feat: add login",
          author_name: "John",
          author_email: "john@test.com",
          files: [],
        },
        {
          hash: "2",
          date: new Date(),
          message: "fix: resolve bug",
          author_name: "Jane",
          author_email: "jane@test.com",
          files: [],
        },
        {
          hash: "3",
          date: new Date(),
          message: "feat: add signup",
          author_name: "Bob",
          author_email: "bob@test.com",
          files: [],
        },
        {
          hash: "4",
          date: new Date(),
          message: "docs: update readme",
          author_name: "Alice",
          author_email: "alice@test.com",
          files: [],
        },
        {
          hash: "5",
          date: new Date(),
          message: "random message",
          author_name: "Charlie",
          author_email: "charlie@test.com",
          files: [],
        },
      ];

      const categories = aggregateCommitsByCategory(mockCommits);

      expect(categories).toHaveLength(4);
      expect(categories.find((c) => c.name === "Feature")?.count).toBe(2);
      expect(categories.find((c) => c.name === "Fix")?.count).toBe(1);
      expect(categories.find((c) => c.name === "Docs")?.count).toBe(1);
      expect(categories.find((c) => c.name === "Other")?.count).toBe(1);
    });

    test("should sort categories by count descending", () => {
      const mockCommits: GitCommit[] = [
        {
          hash: "1",
          date: new Date(),
          message: "docs: update readme",
          author_name: "John",
          author_email: "john@test.com",
          files: [],
        },
        {
          hash: "2",
          date: new Date(),
          message: "feat: add feature 1",
          author_name: "Jane",
          author_email: "jane@test.com",
          files: [],
        },
        {
          hash: "3",
          date: new Date(),
          message: "feat: add feature 2",
          author_name: "Bob",
          author_email: "bob@test.com",
          files: [],
        },
        {
          hash: "4",
          date: new Date(),
          message: "feat: add feature 3",
          author_name: "Alice",
          author_email: "alice@test.com",
          files: [],
        },
      ];

      const categories = aggregateCommitsByCategory(mockCommits);

      expect(categories[0].name).toBe("Feature");
      expect(categories[0].count).toBe(3);
      expect(categories[1].name).toBe("Docs");
      expect(categories[1].count).toBe(1);
    });
  });
});
