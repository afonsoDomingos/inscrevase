import { model, models, Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: 'guide' | 'marketing' | 'mentoring' | 'engagement';
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    readTime: number; // in minutes
    tags: string[];
    published: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        excerpt: {
            type: String,
            required: true,
            maxlength: 300,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['guide', 'marketing', 'mentoring', 'engagement'],
        },
        coverImage: {
            type: String,
            required: true,
        },
        author: {
            name: {
                type: String,
                required: true,
            },
            avatar: {
                type: String,
                default: '',
            },
        },
        readTime: {
            type: Number,
            default: 5,
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        published: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from title if not provided
BlogPostSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    next();
});

export default models.BlogPost || model<IBlogPost>('BlogPost', BlogPostSchema);
