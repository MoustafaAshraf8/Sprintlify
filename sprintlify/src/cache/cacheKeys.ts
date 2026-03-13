export const cacheKeys = {
  user_projects: (userId: string) => `projects:${userId}`,
  project: (projectId: string) => `project:${projectId}`,
  project_members: (projectId: string) => `members:${projectId}`,
  project_tickets: (projectId: string) => `tickets:${projectId}`,
  ticket: (ticketId: string) => `ticket:${ticketId}`,
  ticket_history: (ticketId: string) => `ticket-history:${ticketId}`,
  ticket_state: (ticketId: string) => `ticket-state:${ticketId}`,
  ticket_comments: (ticketId: string) => `comments:${ticketId}`,
  user: (userId: string) => `user:${userId}`,
  users: () => `users:all`,
};
