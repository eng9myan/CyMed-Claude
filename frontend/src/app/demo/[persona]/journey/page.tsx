import { notFound } from 'next/navigation';
import { getPersona } from '@/lib/demo/personas';
import { JourneyWalkthrough } from '@/components/demo/JourneyWalkthrough';

export default async function JourneyPage({ params }: { params: Promise<{ persona: string }> }) {
  const { persona: id } = await params;
  const persona = getPersona(id);
  if (!persona) notFound();
  if (persona.id !== 'hospital') notFound(); // journey is hospital-specific for now
  return <JourneyWalkthrough persona={persona} />;
}
