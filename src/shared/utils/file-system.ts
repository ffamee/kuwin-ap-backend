import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

async function saveFile(
  configService: ConfigService,
  file: Express.Multer.File,
  subDir: string = 'others',
) {
  const uploadDir = join(
    process.cwd(),
    configService.get<string>('UPLOAD_DIR', 'uploads'),
    subDir,
  );
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    throw new InternalServerErrorException(
      `Failed to create upload directory with error: ${error}`,
    );
  }
  try {
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}.${ext}`;
    const filePath = join(uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return `uploads/${subDir}/` + filename;
  } catch (error) {
    throw new InternalServerErrorException(
      `Failed to save file with error: ${error}`,
    );
  }
}

async function deleteFile(filename: string) {
  if (!filename || filename === 'default.png') {
    return; // No file to delete or default file, skip deletion
  }
  try {
    const filePath = join(process.cwd(), filename);
    await fs.promises.access(filePath, fs.constants.F_OK);
    await fs.promises.unlink(filePath);
    return;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File does not exist, no action needed
      throw new NotFoundException(`File ${filename} not found, cannot delete`);
    }
    throw new InternalServerErrorException(
      `Failed to delete file with error: ${error}`,
    );
  }
}

export { saveFile, deleteFile };
