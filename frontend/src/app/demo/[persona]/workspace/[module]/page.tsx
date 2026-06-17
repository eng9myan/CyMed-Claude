import { notFound } from 'next/navigation';
import { getPersona, allowedModulesFor } from '@/lib/demo/personas';
import { DemoModule } from '@/components/demo/DemoModule';

export default async function DemoModulePage({
  params,
}: {
  params: Promise<{ persona: string; module: string }>;
}) {
  const { persona: id, module } = await params;
  const persona = getPersona(id);
  if (!persona) notFound();

  // Allow-list enforcement: prevent cross-persona access
  if (!allowedModulesFor(persona).includes(module)) notFound();

  return <DemoModule persona={persona} moduleId={module} />;
}
