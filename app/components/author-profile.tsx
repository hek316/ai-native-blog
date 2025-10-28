import Image from 'next/image'

interface Author {
  name: string
  bio: string
  avatarUrl: string
}

interface AuthorProfileProps {
  author: Author
}

export default function AuthorProfile({ author }: AuthorProfileProps) {
  return (
    <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <div className="flex items-start gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <Image
            src={author.avatarUrl}
            alt={`${author.name}'s avatar`}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {author.name}
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {author.bio}
          </p>
        </div>
      </div>
    </div>
  )
}
