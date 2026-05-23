'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 个字符'),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginErrors = Partial<Record<keyof LoginValues, string>>;

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const formatted: LoginErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginValues;
        if (!formatted[key]) formatted[key] = issue.message;
      });
      setErrors(formatted);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.error) {
        setServerError('邮箱或密码错误');
        return;
      }

      router.push('/levels');
      router.refresh();
    } catch {
      setServerError('登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {serverError && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      <Input
        label="邮箱"
        name="email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="w-4 h-4" />}
        value={values.email}
        onChange={handleChange('email')}
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="密码"
        name="password"
        type="password"
        placeholder="请输入密码"
        icon={<Lock className="w-4 h-4" />}
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        <LogIn className="w-5 h-5" />
        登录
      </Button>
    </form>
  );
}
