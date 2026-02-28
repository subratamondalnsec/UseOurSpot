"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof formSchema>

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, data)
      
      if (res.data.success && res.data.token) {
        login(res.data.token, res.data.user)
      }
      
      toast("Logged in successfully!", {
        description: "Welcome back to UseOurSpot.",
        position: "bottom-right",
        style: {
          "--border-radius": "calc(var(--radius) + 4px)",
        } as React.CSSProperties,
      })
      
      router.push("/profile")
    } catch (error: any) {
      toast("Login failed", {
        description: error.response?.data?.message || "An error occurred during login.",
        position: "bottom-right",
        style: {
          "--border-radius": "calc(var(--radius) + 4px)",
        } as React.CSSProperties,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="w-full rounded-2xl p-px"
      style={{
        background:
          "linear-gradient(135deg, oklch(1 0 0 / 12%), oklch(1 0 0 / 4%), oklch(0.488 0.243 264.376 / 20%))",
      }}
    >
      <div
        className="rounded-2xl p-6 sm:p-8"
        style={{ background: "oklch(0.145 0 0 / 92%)", backdropFilter: "blur(20px)" }}
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-1.5 text-sm" style={{ color: "oklch(0.708 0 0)" }}>
            Sign in to your UseOurSpot account.
          </p>
        </div>

        {/* Form */}
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="login-email"
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.708 0 0)" }}
                  >
                    Email address
                  </FieldLabel>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel
                      htmlFor="login-password"
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.708 0 0)" }}
                    >
                      Password
                    </FieldLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs transition-colors hover:text-white"
                      style={{ color: "oklch(0.556 0 0)" }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    {...field}
                    id="login-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="mt-1.5"
                    style={{
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      color: "white",
                    }}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Submit */}
          <div className="mt-7 flex flex-col gap-3">
            <Button
              type="submit"
              form="login-form"
              className="w-full font-semibold"
              disabled={isLoading}
              style={{
                background: "oklch(0.87 0 0)",
                color: "oklch(0.145 0 0)",
                height: "42px",
              }}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
              className="w-full text-sm"
              style={{ color: "oklch(0.556 0 0)" }}
            >
              Clear form
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs" style={{ color: "oklch(0.556 0 0)" }}>
          Don&apos;t have an account?{" "}

          <Link
            href="/signup"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}