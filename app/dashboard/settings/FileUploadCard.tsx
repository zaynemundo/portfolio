import { uploadResume, uploadPortrait } from "@/app/actions/settings";
import { UploadCard } from "@/app/dashboard/components/UploadCard";

interface Props {
  title: string;
  description: string;
  currentUrl: string;
  accept: string;
  kind: "resume" | "portrait";
}

export function FileUploadCard({ title, description, currentUrl, accept, kind }: Props) {
  return (
    <UploadCard
      title={title}
      description={description}
      currentUrl={currentUrl}
      accept={accept}
      kind={kind === "portrait" ? "image" : "file"}
      uploadAction={kind === "resume" ? uploadResume : uploadPortrait}
    />
  );
}
