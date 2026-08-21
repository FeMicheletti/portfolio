"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginActionState } from "./actions";

const initialState: LoginActionState = {};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="bg-violet-600 text-white hover:bg-violet-500 w-full" type="submit" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
        </Button>
    );
}

export function LoginForm() {
    const [state, formAction] = useActionState(loginAction, initialState);

    return (
        <form action={formAction} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" autoComplete="email" required placeholder="admin@exemplo.com" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
            </div>

            {state.error ? (
                <p className="text-sm text-destructive" role="alert">
                    {state.error}
                </p>
            ) : null}

            <SubmitButton />
        </form>
    );
}
