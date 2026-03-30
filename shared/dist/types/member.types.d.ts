export type MemberResponse = {
    id: string;
    groupId: string;
    name: string;
    role: string;
    createdAt: string;
};
export type MemberInput = {
    name: string;
    role?: string;
};
