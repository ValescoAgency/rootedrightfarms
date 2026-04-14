import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopNav } from "./top-nav";

describe("TopNav", () => {
  it("renders every primary nav link", () => {
    render(<TopNav />);
    for (const label of ["Home", "Strains", "Services", "About", "Contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });
});
