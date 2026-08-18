import { z } from 'zod'

export const ArtworkStatusEnum = z.enum([
  'pending',
  'clarification',
  'approved',
  'rejected',
  'withdrawn',
])

export type ArtworkStatus = z.infer<typeof ArtworkStatusEnum>

export const ArtworkAwardEnum = z.enum(['first', 'second', 'third', 'highly_commended'])

export type ArtworkAward = z.infer<typeof ArtworkAwardEnum>

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please provide a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long. ' })
    .max(100, { message: 'Password cannot exceed 100 characters.' }),
})

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(30, { message: 'Username cannot exceed 30 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    }),
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(50, { message: 'Name cannot exceed 50 characters.' })
    .regex(/^[a-zA-Z\s]+$/, {
      message: 'Name can only contain letters and spaces.',
    }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password cannot exceed 100 characters.' }),
})

export const AccountSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required.' }),
  name: z.string().min(1, { message: 'Name is required.' }),
  image: z.string().url({ message: 'Please provide a valid URL.' }).optional(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' })
    .max(100, { message: 'Password cannot exceed 100 characters.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Password must contain at least one special character.',
    })
    .optional(),
  provider: z.string().min(1, { message: 'Provider is required.' }),
  providerAccountId: z.string().min(1, { message: 'Provider Account ID is required.' }),
})

export const VerifyArtworkSchema = z.object({
  ownerEmail: z
    .string()
    .min(1, { message: 'Owner email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
  status: ArtworkStatusEnum,
})

export const LikeArtworkSchema = z.object({
  ownerEmail: z
    .string()
    .min(1, { message: 'Owner email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
})

export const SubmitArtworkSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }).max(100),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
  state: z.string().min(1, { message: 'State is required.' }).max(100),
  title: z.string().min(1, { message: 'Title is required.' }).max(150),
  medium: z.string().min(1, { message: 'Medium is required.' }).max(100),
  artworkSize: z.string().min(1, { message: 'Artwork size is required.' }).max(100),
  venue: z.string().min(1, { message: 'Venue is required.' }).max(150),
  dateCreated: z.coerce.date({ message: 'A valid date is required.' }),
  artworkImage: z
    .string()
    .min(1, { message: 'Artwork image URL is required.' })
    .url({ message: 'Please provide a valid image URL.' }),
  proveImage: z
    .string()
    .min(1, { message: 'Proof image URL is required.' })
    .url({ message: 'Please provide a valid image URL.' }),
  agreedToRules: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the competition rules.',
  }),
})

export const UpdateArtworkDetailsSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  name: z.string().min(1, { message: 'Name is required.' }).max(100),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
  state: z.string().min(1, { message: 'State is required.' }).max(100),
  title: z.string().min(1, { message: 'Title is required.' }).max(150),
  medium: z.string().min(1, { message: 'Medium is required.' }).max(100),
  artworkSize: z.string().min(1, { message: 'Artwork size is required.' }).max(100),
  venue: z.string().min(1, { message: 'Venue is required.' }).max(150),
  dateCreated: z.coerce.date({ message: 'A valid date is required.' }),
  artworkImage: z
    .string()
    .min(1, { message: 'Artwork image URL is required.' })
    .url({ message: 'Please provide a valid image URL.' }),
  proveImage: z
    .string()
    .min(1, { message: 'Proof image URL is required.' })
    .url({ message: 'Please provide a valid image URL.' }),
})

export const UpdateArtworkStatusSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  status: ArtworkStatusEnum,
})

export const RejectArtworkSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  reason: z.string().min(1, { message: 'Reason for rejection is required.' }).max(200),
  message: z.string().min(1, { message: 'Message to artist is required.' }).max(1000),
})

export const AddArtworkNoteSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  text: z.string().min(1, { message: 'Note text is required.' }).max(2000),
})

export const UpdateArtworkNoteSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  noteIndex: z.number().int().min(0),
  text: z.string().min(1, { message: 'Note text is required.' }).max(2000),
})

export const DeleteArtworkNoteSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  noteIndex: z.number().int().min(0),
})

export const ConfirmArtworkSubmissionSchema = z.object({
  token: z.string().min(1, { message: 'Token is required.' }),
})

export const GetArtworksSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(8),
  query: z.string().trim().optional(),
  status: z.array(ArtworkStatusEnum).optional(),
  regions: z.array(z.string()).optional(),
  mediums: z.array(z.string()).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
})

export const RequestPublicVoteSchema = z.object({
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please provide a valid email address.' }),
})

export const ConfirmPublicVoteSchema = z.object({
  token: z.string().min(1, { message: 'Token is required.' }),
})

export const UpdateCompetitionDateSchema = z.object({
  id: z.string().min(1, { message: 'Id is required.' }),
  date: z.coerce.date({ message: 'A valid date is required.' }),
})

export const UpdateJudgeFieldSchema = z
  .object({
    judgeId: z.string().min(1, { message: 'Judge is required.' }),
    field: z.enum(['name', 'email']),
    value: z.string().trim().max(150, { message: 'Value cannot exceed 150 characters.' }),
  })
  .refine(
    (data) => data.field !== 'email' || data.value === '' || z.string().email().safeParse(data.value).success,
    { message: 'Please provide a valid email address.', path: ['value'] },
  )

export const ToggleJudgeShortlistSchema = z.object({
  slug: z.string().min(1, { message: 'Judge link is required.' }),
  artworkId: z.string().min(1, { message: 'Artwork is required.' }),
})

export const SubmitJudgeShortlistSchema = z.object({
  slug: z.string().min(1, { message: 'Judge link is required.' }),
})

export const ConfirmWinnersSchema = z
  .object({
    first: z.string().min(1, { message: 'First prize work is required.' }),
    second: z.string().min(1, { message: 'Second prize work is required.' }),
    third: z.string().min(1, { message: 'Third prize work is required.' }),
    highlyCommended: z
      .array(z.string().min(1))
      .min(1, { message: 'Select at least one Highly Commended work.' })
      .max(5, { message: 'You can select up to 5 Highly Commended works.' }),
  })
  .refine(
    (data) => {
      const all = [data.first, data.second, data.third, ...data.highlyCommended]
      return new Set(all).size === all.length
    },
    { message: 'Each work can only be awarded once.', path: ['highlyCommended'] },
  )

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(['google', 'github']),
  providerAccountId: z.string().min(1, { message: 'Provider account ID is required.' }),
  user: z.object({
    name: z.string().min(1, { message: 'Name is required.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }),
    email: z.string().email({ message: 'Please provide a valid email address.' }),
    image: z.string().url('Invalid image URL.').optional(),
  }),
})
