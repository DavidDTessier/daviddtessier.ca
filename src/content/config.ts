import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
    type: 'content',
    schema: ({image}) => z.object({
        date: z.string(),
        image: image(),
        title: z.string(),
        description: z.string(),
        categories: z.array(z.string()) 
    })
})

const credentialCollection = defineCollection({
    type: 'data',
    schema: ({image}) => z.object({
        issued_date: z.string(),
        renewed_date: z.string().optional(),
        expired_date: z.string().optional(),
        badge: image(),
        name: z.string(),
        alt: z.string(),
        credential_link: z.string() 
    })
})

export const collections = {
    posts: postCollection,
    credentials: credentialCollection
}