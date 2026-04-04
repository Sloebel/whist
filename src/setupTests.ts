import "@testing-library/jest-dom";

jest.mock("lottie-react", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef((_props: Record<string, unknown>, _ref: unknown) =>
      React.createElement("div", { "data-testid": "lottie-mock" })
    ),
  };
});
