import { redirect, notFound } from 'next/navigation';
import { getPersona } from '@/lib/demo/personas';

export default async function DemoWorkspaceEntry({ params }: { params: Promise<{ persona: string }> }) {
  const { persona: id } = await params;
  const persona = getPersona(id);
  if (!persona) notFound();
  // Redirect to the persona's default module
  redirect(persona.defaultRoute);
}
