import { describe, it, expect } from "vitest";
import { GAMES } from "../src/lib/games";
import { nextDrawFor, upcomingDraws, featuredGame } from "../src/lib/schedule";

// Reference dates (UTC). 2026-07-04 is a Saturday.
const saturday = new Date("2026-07-04T12:00:00Z");
const tuesday = new Date("2026-07-07T12:00:00Z");
const sunday = new Date("2026-07-05T12:00:00Z");

describe("nextDrawFor", () => {
  it("returns today's draw when today is a draw day", () => {
    // Saturday is a Lotto draw day.
    const nd = nextDrawFor(GAMES.lotto, saturday);
    expect(nd.weekdayName).toBe("Saturday");
    expect(nd.daysUntil).toBe(0);
    expect(nd.isToday).toBe(true);
    expect(nd.date).toBe("2026-07-04");
  });

  it("finds the next EuroMillions draw (Tuesday) from a Sunday", () => {
    const nd = nextDrawFor(GAMES.euromillions, sunday);
    expect(nd.weekdayName).toBe("Tuesday");
    expect(nd.daysUntil).toBe(2);
    expect(nd.date).toBe("2026-07-07");
  });

  it("picks the nearer of the two weekly draw days", () => {
    // Tuesday: EuroMillions draws today; Lotto's next is Wednesday.
    expect(nextDrawFor(GAMES.euromillions, tuesday).daysUntil).toBe(0);
    expect(nextDrawFor(GAMES.lotto, tuesday).weekdayName).toBe("Wednesday");
  });
});

describe("upcomingDraws", () => {
  it("is sorted soonest-first", () => {
    const list = upcomingDraws(sunday);
    expect(list[0].daysUntil).toBeLessThanOrEqual(list[1].daysUntil);
  });
});

describe("featuredGame", () => {
  it("features Lotto on a Saturday", () => {
    expect(featuredGame(saturday)).toBe("lotto");
  });
  it("features EuroMillions on a Tuesday", () => {
    expect(featuredGame(tuesday)).toBe("euromillions");
  });
});
