export interface Project {
    id: string;
    name: string;
    type: 'quilt' | 'embroidery';
    date: Date;
    icon: string;
}