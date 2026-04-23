import { AdminAnalysisTypePointItem } from "@entities/adminAnalysisType";

interface AnalysisTypePointListProps {
  list: AdminAnalysisTypePointItem[];
}
export const AnalysisTypePointList = ({ list }: AnalysisTypePointListProps) => {
  return (
    <ul>
      {list.map((item) => (
        <li>{item.translationRu}</li>
      ))}
    </ul>
  );
};
