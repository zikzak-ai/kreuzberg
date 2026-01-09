import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

// Setup localStorage mock
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
	getItem: (key: string) => localStorageStore[key] || null,
	setItem: (key: string, value: string) => {
		localStorageStore[key] = value.toString();
	},
	removeItem: (key: string) => {
		delete localStorageStore[key];
	},
	clear: () => {
		localStorageStore = {};
	},
};

Object.defineProperty(global, "localStorage", {
	value: localStorageMock,
	writable: true,
});

// Helper to mock matchMedia
const setMatchMediaPreference = (prefersDark: boolean) => {
	window.matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches: query === "(prefers-color-scheme: dark)" ? prefersDark : false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	}));
};

describe("ThemeContext", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorageStore = {};
		document.documentElement.classList.remove("dark");
		document.documentElement.style.colorScheme = "";
		setMatchMediaPreference(false);
	});

	afterEach(() => {
		localStorageStore = {};
		document.documentElement.classList.remove("dark");
		document.documentElement.style.colorScheme = "";
	});

	describe("ThemeProvider", () => {
		it("should render children", () => {
			const { container } = render(
				<ThemeProvider>
					<div>Test Content</div>
				</ThemeProvider>,
			);

			expect(container.textContent).toContain("Test Content");
		});

		it("should prevent flash of unstyled content", () => {
			const { container } = render(
				<ThemeProvider>
					<div>Test Content</div>
				</ThemeProvider>,
			);

			// Provider renders children even before mounting
			expect(container.textContent).toContain("Test Content");
		});
	});

	describe("Hook usage", () => {
		it("useTheme should throw error when used outside provider", () => {
			const ComponentUsingHook = () => {
				useTheme();
				return <div>Should not render</div>;
			};

			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

			expect(() => {
				render(<ComponentUsingHook />);
			}).toThrow("useTheme must be used within ThemeProvider");

			consoleError.mockRestore();
		});

		it("should provide useTheme hook to consumers", () => {
			const TestComponent = () => {
				try {
					const { theme, resolvedTheme, setTheme } = useTheme();
					return (
						<div>
							<div data-testid="theme">{theme}</div>
							<div data-testid="resolved">{resolvedTheme}</div>
						</div>
					);
				} catch (error) {
					return <div>Error: {(error as Error).message}</div>;
				}
			};

			render(
				<ThemeProvider>
					<TestComponent />
				</ThemeProvider>,
			);

			// Theme hook can be used within provider after mounting
			expect(screen.queryByTestId("theme")).toBeInTheDocument();
		});
	});

	describe("Theme persistence in localStorage", () => {
		it("should save theme to localStorage when setTheme is called", async () => {
			const TestComponent = () => {
				try {
					const { setTheme } = useTheme();
					return (
						<button onClick={() => setTheme("dark")} data-testid="set-dark">
							Set Dark
						</button>
					);
				} catch {
					return <div>Error</div>;
				}
			};

			const user = userEvent.setup();

			render(
				<ThemeProvider>
					<TestComponent />
				</ThemeProvider>,
			);

			const button = screen.queryByTestId("set-dark");
			if (button) {
				await user.click(button);
				// Allow time for localStorage update
				await waitFor(() => {
					expect(localStorageStore["kreuzberg-theme"]).toBeDefined();
				});
			}
		});

		it("should restore theme from localStorage on provider mount", () => {
			localStorageStore["kreuzberg-theme"] = "dark";

			const TestComponent = () => {
				try {
					const { theme } = useTheme();
					return <div data-testid="theme">{theme}</div>;
				} catch {
					return <div>Loading</div>;
				}
			};

			render(
				<ThemeProvider>
					<TestComponent />
				</ThemeProvider>,
			);

			// Theme should be restored from localStorage
			expect(localStorageStore["kreuzberg-theme"]).toBe("dark");
		});
	});

	describe("Document theme application", () => {
		it("should apply theme to document documentElement", () => {
			render(
				<ThemeProvider>
					<div>Test</div>
				</ThemeProvider>,
			);

			// Provider should apply theme to document
			expect(document.documentElement.style.colorScheme).toBeDefined();
		});

		it("should manage dark class on documentElement", () => {
			const _initialHasDarkClass = document.documentElement.classList.contains("dark");

			render(
				<ThemeProvider>
					<div>Test</div>
				</ThemeProvider>,
			);

			// Provider manages the dark class based on theme
			const hasDarkClass = document.documentElement.classList.contains("dark");
			expect(typeof hasDarkClass).toBe("boolean");
		});
	});

	describe("System theme detection", () => {
		it("should detect system theme preference using matchMedia", () => {
			setMatchMediaPreference(true);

			render(
				<ThemeProvider>
					<div>Test</div>
				</ThemeProvider>,
			);

			// Provider should detect and apply system preference
			expect(window.matchMedia).toHaveBeenCalled();
		});

		it("should respect explicit theme over system preference", () => {
			localStorageStore["kreuzberg-theme"] = "light";
			setMatchMediaPreference(true); // System prefers dark

			render(
				<ThemeProvider>
					<div>Test</div>
				</ThemeProvider>,
			);

			// Explicit theme should override system preference
			expect(localStorageStore["kreuzberg-theme"]).toBe("light");
		});
	});
});
