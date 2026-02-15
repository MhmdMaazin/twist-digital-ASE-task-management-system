'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { APIError } from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof APIError) {
        // Check if details is an array of validation errors
        if (Array.isArray(err.details)) {
          const errors: Record<string, string> = {};
          err.details.forEach((detail: any) => {
            errors[detail.field] = detail.message;
          });
          setFieldErrors(errors);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-muted px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-primary/10">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto mb-2">
            <div className="text-3xl font-bold">
              <span className="text-primary">TWI</span>
              <span className="text-accent">S</span>
              <span className="text-primary">T</span>
              <span className="text-muted-foreground text-xxl ml-1">DIGITAL</span>
              <span className="text-foreground text-base block mt-1">Task Management System</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-base">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={loading}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-accent/20"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {fieldErrors.name && (
                <p id="name-error" className="text-sm text-destructive font-medium">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-accent/20"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-sm text-destructive font-medium">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
                required
                className="h-11 transition-all focus:ring-2 focus:ring-accent/20"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? 'password-error' : undefined
                }
              />
              {fieldErrors.password && (
                <p id="password-error" className="text-sm text-destructive font-medium">
                  {fieldErrors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
