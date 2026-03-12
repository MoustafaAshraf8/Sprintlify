export const apiRoute = {
  base: "/api",
  auth: "/api/auth",
  register: "/register",
  login: "login",
  logout: "singout",
  refresh: "/refresh",
  authenticate: "/authenticate",
  projects: "/api/projects",
  projectMembers: "/api/projects/:projectId/members",
  tickets: "/api/projects/:projectId/tickets",
  ticketComments: "/api/projects/:projectId/tickets/:ticketId/comments",
};
