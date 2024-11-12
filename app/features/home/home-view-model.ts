import { Observable } from '@nativescript/core';
import { ImagePicker } from '@nativescript/imagepicker';
import { FileService } from '~/shared/services/file.service';
import { Project } from '~/shared/models/project.model';

export class HomeViewModel extends Observable {
    private imagePicker: ImagePicker;
    private fileService: FileService;
    public recentProjects: Array<Project>;

    constructor() {
        super();
        this.imagePicker = new ImagePicker();
        this.fileService = new FileService();
        
        this.recentProjects = [
            {
                id: '1',
                name: "Summer Quilt Pattern",
                type: 'quilt',
                date: new Date(),
                icon: "res://icon_quilt"
            },
            {
                id: '2',
                name: "Flower Embroidery",
                type: 'embroidery',
                date: new Date(),
                icon: "res://icon_embroidery"
            }
        ];
    }

    async onSelectImage() {
        try {
            const selection = await this.imagePicker.authorize();
            if (selection) {
                const imageAsset = await this.imagePicker.present();
                if (imageAsset) {
                    console.log("Image selected");
                    // Handle image processing
                }
            }
        } catch (err) {
            console.error("Error selecting image:", err);
        }
    }

    onNewQuiltPattern() {
        // Navigate to quilt pattern designer
        console.log("New quilt pattern requested");
    }

    onNewEmbroidery() {
        // Navigate to embroidery designer
        console.log("New embroidery requested");
    }
}