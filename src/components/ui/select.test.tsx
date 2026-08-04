"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Select } from "./select";

describe("Select Component", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("rend un select natif avec les options fournies", () => {
    render(<Select options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(select).toHaveClass("bg-mrz-bg-elevated");
    expect(select).toHaveClass("border-mrz-border");
    
    options.forEach((option) => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it("appelle onChange quand une option est sélectionnée", async () => {
    const onChange = vi.fn();
    render(<Select options={options} onChange={onChange} />);
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "option2");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Object)); // Event
  });

  it("affiche le label associé si fourni", () => {
    render(<Select options={options} label="Choisissez une option" />);
    expect(screen.getByText("Choisissez une option")).toBeInTheDocument();
    expect(screen.getByLabelText("Choisissez une option")).toBeInTheDocument();
  });

  it("affiche un message d'erreur si fourni", () => {
    render(<Select options={options} error="Ce champ est requis" />);
    expect(screen.getByText("Ce champ est requis")).toBeInTheDocument();
    expect(screen.getByText("Ce champ est requis")).toHaveAttribute("role", "alert");
  });

  it("affiche l'icône ChevronDown", () => {
    render(<Select options={options} />);
    expect(screen.getByTestId("chevron-down-icon")).toBeInTheDocument();
  });

  it("affiche la valeur sélectionnée si value est fourni", () => {
    render(<Select options={options} value="option2" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("option2");
  });

  it("associe le label au select via htmlFor/id", () => {
    render(<Select options={options} label="Choisissez une option" id="test-select" />);
    const label = screen.getByText("Choisissez une option");
    const select = screen.getByRole("combobox");
    expect(label).toHaveAttribute("for", "test-select");
    expect(select).toHaveAttribute("id", "test-select");
  });

  it("a le bon focus ring", () => {
    render(<Select options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveClass("focus-visible:ring-2");
    expect(select).toHaveClass("focus-visible:ring-amber-500/50");
  });
});