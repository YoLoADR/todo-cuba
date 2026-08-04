import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });

  it("renders with correct variant classes", () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByText("Primary");
    expect(btn.className).toContain("bg-amber-500");
  });

  it("renders with correct size classes", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByText("Small");
    expect(btn.className).toContain("text-xs");
  });

  it("renders icon when provided", () => {
    render(<Button icon={Plus}>Add</Button>);
    const svg = screen.getByText("Add").querySelector("svg");
    expect(svg).toBeDefined();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByText("Disabled");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("has rounded-md class (6px radius)", () => {
    render(<Button>Test</Button>);
    expect(screen.getByText("Test").className).toContain("rounded-md");
  });

  it("has focus-visible ring classes", () => {
    render(<Button>Test</Button>);
    expect(screen.getByText("Test").className).toContain("focus-visible:ring-2");
    expect(screen.getByText("Test").className).toContain("ring-amber-500/50");
  });
});