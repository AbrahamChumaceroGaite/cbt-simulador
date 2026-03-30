export type PlantasRole = 'admin' | 'group';
export type SessionPayload = {
    userId: string;
    role: PlantasRole;
    groupId?: string;
    code: string;
    fullName: string;
};
