import { Observable } from '@nativescript/core';
import { ImagePicker } from '@nativescript/imagepicker';

export class HomeViewModel extends Observable {
    private imagePicker: ImagePicker;
    public recentProjects: Array<any>;

    constructor() {
        super();
        this.imagePicker = new ImagePicker();
        
        // Initialize with sample data
        this.recentProjects = [
            {
                name: "Summer Quilt Pattern",
                date: "2 hours ago",
                icon: "res://icon_quilt"
            },
            {
                name: "Flower Embroidery",
                date: "Yesterday",
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
                    // TODO: Handle image conversion
                }
            }
        } catch (err) {
            console.error("Error selecting image:", err);
        }
    }

    onSelectPdf() {
        // TODO: Implement PDF selection and conversion
        console.log("PDF selection requested");
    }

    onNewQuiltPattern() {
        // TODO: Navigate to quilt pattern designer
        console.log("New quilt pattern requested");
    }

    onNewEmbroidery() {
        // TODO: Navigate to embroidery designer
        console.log("New embroidery requested");
    }
}