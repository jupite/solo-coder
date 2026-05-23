'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registerSchema = z
  .object({
    name: z.string().min(2, '昵称至少 2 个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少 6 个字符'),
    confirmPassword: z.string().min(6, '密码至少 6 个字符'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;
type RegisterErrors = Partial<Record<keyof RegisterValues | 'root', string>>;

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(values);
    if (!result.success) {
      const formatted: RegisterErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof RegisterValues;
        if (!formatted[key]) formatted[key] = issue.message;
      });
      setErrors(formatted);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error || '注册失败，请稍后再试');
        return;
      }

      router.push('/login');
    } catch {
      setServerError('注册失败，请稍后再试');
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
        label="昵称"
        name="name"
        type="text"
        placeholder="你的昵称"
        icon={<User className="w-4 h-4" />}
        value={values.name}
        onChange={handleChange('name')}
        error={errors.name}
        autoComplete="name"
      />

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
        placeholder="至少 6 个字符"
        icon={<Lock className="w-4 h-4" />}
        value={values.password}
        onChange={handleChange('password')}
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="确认密码"
        name="confirmPassword"
        type="password"
        placeholder="再次输入密码"
        icon={<Lock className="w-4 h-4" />}
        value={values.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" size="lg" fullWidth loading={loading}>
        <UserPlus className="w-5 h-5" />
        注册
      </Button>
    </form>
  );
}
