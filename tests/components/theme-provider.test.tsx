import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";

// Composant de test qui expose le thème
function ThemeTestComponent() {
  const { theme } = useTheme();
  return <div data-testid="theme-value">{theme}</div>;
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to dark theme", () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
  });

  it("sets data-theme attribute on html element", () => {
    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>,
    );
    // Le useEffect met à jour l'attribut après le mount
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("reads theme from data-theme attribute on html (set by anti-flash script)", async () => {
    document.documentElement.setAttribute("data-theme", "light");
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>,
    );
    // La lazy init lit data-theme depuis <html>
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });

  it("toggleTheme switches from dark to light", async () => {
    const user = userEvent.setup();
    const ToggleTest = () => {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme-value">{theme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <ToggleTest />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    await user.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("theme-value").textContent).toBe("light");
  });

  it("persists theme to localStorage on toggle", async () => {
    const user = userEvent.setup();
    const ToggleTest = () => {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>Toggle</button>;
    };

    render(
      <ThemeProvider>
        <ToggleTest />
      </ThemeProvider>,
    );

    await user.click(screen.getByText("Toggle"));
    expect(localStorage.getItem("merenza-theme")).toBe("light");
  });

  it("throws when useTheme is used outside ThemeProvider", () => {
    // Supprime les erreurs de console pour ce test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      render(<ThemeTestComponent />);
    }).toThrow("useTheme doit être utilisé dans un ThemeProvider");
    spy.mockRestore();
  });
});