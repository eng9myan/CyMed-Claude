import { notFound } from 'next/navigation';
import { getPersona } from '@/lib/demo/personas';
import { DemoShell } from '@/components/demo/DemoShell';

export default async function DemoWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ persona: string }>;
}) {
  const { persona: id } = await params;
  const persona = getPersona(id);
  if (!persona) notFound();
  return <DemoShell persona={persona}>{children}</DemoShell>;
}
