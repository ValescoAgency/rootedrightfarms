import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CookieBanner } from "./cookie-banner";

function clearCookies() {
  document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter(Boolean)
    .forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    });
}

describe("CookieBanner", () => {
  beforeEach(() => clearCookies());
  afterEach(() => {
    cleanup();
    clearCookies();
  });

  it("renders when dismissal cookie is absent", () => {
    render(<CookieBanner />);
    expect(screen.getByRole("region", { name: /cookie notice/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /got it/i })).toBeInTheDocument();
  });

  it("does not render when the dismissal cookie is present", () => {
    document.cookie = "rrf_cookie_dismissed=1; Path=/";
    render(<CookieBanner />);
    expect(screen.queryByRole("region", { name: /cookie notice/i })).toBeNull();
  });

  it("dismisses and writes the cookie on click", () => {
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));
    expect(document.cookie).toMatch(/rrf_cookie_dismissed=1/);
    expect(screen.queryByRole("region", { name: /cookie notice/i })).toBeNull();
  });
});
