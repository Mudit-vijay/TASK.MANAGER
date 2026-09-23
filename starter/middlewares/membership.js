export const normalizeEmail = value => String(value || "").trim().toLowerCase();

export const groupRole = (group, user) => {
    if (String(group.user) === String(user.id)) return "OWNER";
    const membership = (group.memberUsers || []).find(member => String(member.user) === String(user.id));
    if (membership) return membership.role || "MEMBER";
    return (group.members || []).some(email => normalizeEmail(email) === normalizeEmail(user.email))
        ? "MEMBER"
        : null;
};

export const isGroupManager = (group, user) => ["OWNER", "ADMIN"].includes(groupRole(group, user));
