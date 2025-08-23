import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export const ResendOTPPasswordReset = Resend({
    id: "resend-otp",
    apiKey: process.env.AUTH_RESEND_KEY,
    async generateVerificationToken() {
        const random: RandomReader = { read(bytes) { crypto.getRandomValues(bytes); } };
        const alphabet = "0123456789";
        const length = 8;
        return generateRandomString(random, alphabet, length);
    },
    async sendVerificationRequest({ identifier: email, provider, token }) {
        const apiKey = provider.apiKey || process.env.AUTH_RESEND_KEY;
        if (!apiKey) {
            throw new Error("Missing Resend API key. Please set AUTH_RESEND_KEY environment variable.");
        }
        
        const resend = new ResendAPI(apiKey);
        const { error } = await resend.emails.send({
            from: "My App <onboarding@resend.dev>",
            to: [email],
            subject: `Reset your password in My App`,
            text: "Your password reset code is " + token,
        });
        if (error) throw new Error("Could not send email: " + JSON.stringify(error));
    },
});