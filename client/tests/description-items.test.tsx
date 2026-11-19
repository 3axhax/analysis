import { render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionItems } from "../src/widgets/analysisDescriptionList/ui/DescriptionItems";

describe("interpretation description items", () => {
  it("renders a single sentence as one list item", () => {
    const { container } = render(<DescriptionItems description="Возможна вирусная инфекция." />);

    const view = within(container);
    expect(view.getByRole("list").textContent).toBe("Возможна вирусная инфекция.");
    expect(view.getAllByRole("listitem")).toHaveLength(1);
  });

  it("keeps paragraphs and legacy list items in their original order", () => {
    const { container } = render(
      <DescriptionItems
        description={
          "Первый абзац. Второе предложение.\r\n\r\nВторой абзац.\nПродолжение." +
          "<ul><li>Причина &amp; уточнение<li>Другая причина</ul>" +
          "<p>Заключительный абзац.</p><p> </p><script>Скрытый текст</script>"
        }
      />,
    );

    const view = within(container);
    expect(view.getAllByRole("list")).toHaveLength(1);
    expect(view.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Первый абзац. Второе предложение.",
      "Второй абзац. Продолжение.",
      "Причина & уточнение",
      "Другая причина",
      "Заключительный абзац.",
    ]);
  });
});
