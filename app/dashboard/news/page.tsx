import { getAllNews } from "@/services/news.service";
import { NewsClient } from "./news-client";

export default async function NewsPage() {
  const news = await getAllNews();
  return <NewsClient news={news} />;
}
