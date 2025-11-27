import { z } from "zod";

export const createApiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
    success: z.boolean(),
    error: z.string().nullable(),
    message: z.string().nullable(),
    data: dataSchema,
})