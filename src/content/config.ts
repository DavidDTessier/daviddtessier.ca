import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
    schema: ({image}) => z.object({
        date: z.string(),
        image: image(),
        title: z.string(),
        description: z.string(),
        categories: z.array(z.string()) 
    })
})

export const collections = {
    posts: postCollection
}