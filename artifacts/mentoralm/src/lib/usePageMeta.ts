import { useEffect } from "react";

const BASE_TITLE = "MentorAlm — AI Career Counselling for Indian Students";

export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | MentorAlm` : BASE_TITLE;

    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaDesc?.content;
    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      document.title = prev;
      if (metaDesc && prevDesc !== undefined) metaDesc.content = prevDesc;
    };
  }, [title, description]);
}
