import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { auth } from '@/auth'
import { AuthPageShell } from '@/components/AuthPageShell'

export default async function RegisterPage({ params }: PageProps<'/[locale]/register'>) {
  const { locale } = await params
  setRequestLocale(locale)
  if (await auth()) redirect(`/${locale}/links`)
  return <AuthPageShell mode="register" />
}
