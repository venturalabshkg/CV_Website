import { revalidatePath } from "next/cache";

export function refreshSite(paths: string[] = []) {
  revalidatePath("/", "layout");
  for (const path of paths) revalidatePath(path);
}
