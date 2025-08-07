import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

// Custom render function that wraps components for testing
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  // Simple wrapper that just returns children (no providers needed for basic tests)
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from @testing-library/react except render
export {
  screen,
  waitFor,
  fireEvent,
  cleanup,
  act,
  renderHook,
  within,
  getByRole,
  getByText,
  getByTestId,
  queryByText,
  queryByRole,
  queryByTestId,
  findByText,
  findByRole,
  findByTestId,
} from "@testing-library/react";

export { customRender as render };
