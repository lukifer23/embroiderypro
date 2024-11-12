import { ImageSource, knownFolders, path } from '@nativescript/core';

export class FileService {
    private documentsFolder = knownFolders.documents();

    async saveImage(image: ImageSource, fileName: string): Promise<string> {
        const filePath = path.join(this.documentsFolder.path, fileName);
        const saved = await image.saveToFile(filePath, "png");
        return saved ? filePath : null;
    }

    async loadImage(filePath: string): Promise<ImageSource> {
        return await ImageSource.fromFile(filePath);
    }
}