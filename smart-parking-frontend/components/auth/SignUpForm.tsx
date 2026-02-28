"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["driver", "owner"], {
    message: "Please select a role.",
  }),
})

type FormValues = z.infer<typeof formSchema>

const roles = [
  {
    value: "driver",
    label: "Driver",
    description: "Browse and book spaces",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    value: "owner",
    label: "Owner",
    description: "List and manage spaces",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

export function SignUpForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const selectedRole = form.watch("role")

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, data)
      
      toast("Account created!", {
        description: "Welcome to UseOurSpot. You're all set.",
        position: "bottom-right",
        style: {
          "--border-radius": "calc(var(--radius) + 4px)",
        } as React.CSSProperties,
      })
      
      router.push("/login")
    } catch (error: any) {
      toast("Sign up failed", {
        description: error.response?.data?.message || "An error occurred during sign up.",
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="mt-1.5 text-sm" style={{ color: "oklch(0.708 0 0)" }}>
            Join UseOurSpot and find your perfect space.
          </p>
        </div>

        {/* Form */}
        <form id="signup-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-5">

            {/* Name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="signup-name"
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.708 0 0)" }}
                  >
                    Full Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signup-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="John Doe"
                    autoComplete="name"
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

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="signup-email"
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.708 0 0)" }}
                  >
                    Email address
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signup-email"
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
                  <FieldLabel
                    htmlFor="signup-password"
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.708 0 0)" }}
                  >
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="signup-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
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

            {/* Role — custom card picker */}
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.708 0 0)" }}
                  >
                    I want to
                  </FieldLabel>
                  <div className="mt-1.5 grid grid-cols-2 gap-3">
                    {roles.map((role) => {
                      const isSelected = selectedRole === role.value
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => field.onChange(role.value)}
                          className="relative flex flex-col items-start gap-1.5 rounded-xl p-4 text-left transition-all duration-150"
                          style={{
                            background: isSelected
                              ? "oklch(0.488 0.243 264.376 / 15%)"
                              : "oklch(1 0 0 / 5%)",
                            border: isSelected
                              ? "1px solid oklch(0.623 0.214 259.815 / 60%)"
                              : "1px solid oklch(1 0 0 / 10%)",
                            boxShadow: isSelected
                              ? "0 0 0 1px oklch(0.488 0.243 264.376 / 20%) inset"
                              : "none",
                          }}
                        >
                          {/* Selected dot */}
                          {isSelected && (
                            <span
                              className="absolute top-3 right-3 flex h-2 w-2 rounded-full"
                              style={{ background: "oklch(0.623 0.214 259.815)" }}
                            />
                          )}
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{
                              background: isSelected
                                ? "oklch(0.488 0.243 264.376 / 25%)"
                                : "oklch(1 0 0 / 8%)",
                              color: isSelected ? "oklch(0.809 0.105 251.813)" : "oklch(0.708 0 0)",
                            }}
                          >
                            {role.icon}
                          </span>
                          <span className="text-sm font-semibold text-white">{role.label}</span>
                          <span className="text-xs leading-snug" style={{ color: "oklch(0.556 0 0)" }}>
                            {role.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Submit */}
          <div className="mt-7 flex flex-col gap-3">
            <Button
              type="submit"
              form="signup-form"
              className="w-full font-semibold"
              disabled={isLoading}
              style={{
                background: "oklch(0.87 0 0)",
                color: "oklch(0.145 0 0)",
                height: "42px",
              }}
            >
              {isLoading ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}