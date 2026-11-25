const imageFiles = import.meta.glob<string>("../assets/article-groups/*.jpg", {
  eager: true,
  import: "default",
  query: "?url",
});
export const groupImages: Record<string, string> = Object.fromEntries(
  Object.entries(imageFiles).map(([path, url]) => [
    path
      .split("/")
      .pop()!
      .replace(/(?:-v1)?\.jpg$/, ""),
    url,
  ]),
);
groupImages["obshchiy-analiz-krovi"] = groupImages["complete-blood-count"];
