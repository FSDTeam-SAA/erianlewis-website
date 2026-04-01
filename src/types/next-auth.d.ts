import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: DefaultSession["user"] & {
            role?: string;
            accessToken?: string;
            refreshToken?: string;
        };
    }

    interface User {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
        profileImage?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
        picture?: string | null;
    }
}
