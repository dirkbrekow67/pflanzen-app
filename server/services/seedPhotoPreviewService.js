import path from "path";
import sharp from "sharp";

const uploadDir = "server/uploads";

export async function createSeedPhotoPreview(fileName) {
  const sourcePath = path.join(uploadDir, fileName);
  const parsedPath = path.parse(fileName);

  const previewFileName = path.join(
    parsedPath.dir,
    `preview-${parsedPath.base}`,
  );

  const previewPath = path.join(uploadDir, previewFileName);

  await sharp(sourcePath)
    .rotate()
    .trim({ background: "#ffffff", threshold: 25 })
    .resize({
      width: 700,
      height: 700,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(previewPath);

  return previewFileName;
}
