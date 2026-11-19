const blockTags = new Set(["DIV", "P", "LI", "UL", "OL"]);
const hiddenTags = new Set(["SCRIPT", "STYLE", "TEMPLATE"]);

function getDescriptionItems(description: string): string[] {
  // Parse legacy markup in an inert template and render only its text.
  const template = document.createElement("template");
  template.innerHTML = description;

  const items: string[] = [];
  let text = "";

  function finishBlock() {
    for (const paragraph of text.split(/\r?\n(?:[^\S\r\n]*\r?\n)+/)) {
      const item = paragraph.replace(/\r?\n/g, " ").trim();
      if (item) items.push(item);
    }
    text = "";
  }

  function collect(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      return;
    }
    if (hiddenTags.has(node.nodeName)) return;
    if (node.nodeName === "BR") {
      text += "\n";
      return;
    }

    const isBlock = blockTags.has(node.nodeName);
    if (isBlock) finishBlock();
    node.childNodes.forEach(collect);
    if (isBlock) finishBlock();
  }

  collect(template.content);
  finishBlock();
  return items;
}

export function DescriptionItems({ description }: { description: string }) {
  return (
    <ul>
      {getDescriptionItems(description).map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
