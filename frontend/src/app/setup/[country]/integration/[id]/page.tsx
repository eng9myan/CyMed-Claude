import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCountry } from '@/lib/setup/countries';
import { IntegrationForm } from '@/components/setup/IntegrationForm';

export default async function IntegrationSetupPage({
  params,
}: {
  params: Promise<{ country: string; id: string }>;
}) {
  const { country, id } = await params;
  const c = getCountry(country);
  if (!c) notFound();
  const integration = c.integrations.find(i => i.id === id);
  if (!integration) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-3xl mx-auto py-12">
        <Link href={`/setup/${country}`} className="text-sm text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2">
          ← Back to {c.name} integrations
        </Link>
        <IntegrationForm integration={integration} country={c.name} flag={c.flag} />
      </div>
    </div>
  );
}
