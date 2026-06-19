export const paths = {
  home: '/',
  library: '/library',
  book: (residentId: string) => `/books/${residentId}`,
  bookIndex: (residentId: string) => `/books/${residentId}/index`,
  bookRecord: (residentId: string) => `/books/${residentId}/record`,
  bookStory: (residentId: string, storyId: string) => `/books/${residentId}/stories/${storyId}`,
  bookPrint: (residentId: string) => `/books/${residentId}/print`,
} as const;
