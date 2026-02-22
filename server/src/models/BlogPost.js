const { model, models, Schema } = require('mongoose');

const BlogPostSchema = new Schema(
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
            enum: ['guide', 'marketing', 'mentoring', 'engagement', 'event', 'case-study'],
        },
        coverImage: {
            type: String,
            default: '',
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
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                user: {
                    id: { type: Schema.Types.ObjectId, ref: 'User' },
                    name: String,
                    avatar: String,
                },
                text: { type: String, required: true },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from title if not provided
BlogPostSchema.pre('validate', function () {
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
});

module.exports = models.BlogPost || model('BlogPost', BlogPostSchema);
