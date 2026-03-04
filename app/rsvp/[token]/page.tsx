import { getServiceClient } from "@/lib/supabase";
import { RsvpPageClient } from "./client";
import { EVENT } from "@/lib/constants";
import { OrnamentalDivider } from "@/components/ornamental-divider";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  void token;
  return {
    title: `RSVP | ${EVENT.title}`,
    description: `RSVP for ${EVENT.title} on ${EVENT.date}`,
  };
}

export default async function RsvpPage({ params }: Props) {
  const { token } = await params;
  const supabase = getServiceClient();

  const { data: guest } = await supabase
    .from("guests")
    .select("*")
    .eq("invite_token", token)
    .single();

  if (!guest) {
    return (
      <main className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl text-gold-400">
            Invitation Not Found
          </h1>
          <p className="text-cream-200 font-sans">
            This invitation link is not valid. Please check the link from your
            invite.
          </p>
        </div>
      </main>
    );
  }

  if (!guest.invite_opened_at) {
    await supabase
      .from("guests")
      .update({ invite_opened_at: new Date().toISOString() })
      .eq("id", guest.id);
  }

  return (
    <main className="min-h-screen bg-navy-950">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-center font-serif text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 gold-shimmer">
          {EVENT.title}
        </h1>
        <p className="text-center text-cream-200 font-sans mb-2">
          {EVENT.date} &middot; {EVENT.time}
        </p>
        <p className="text-center text-cream-200/60 font-sans text-sm mb-8">
          {EVENT.venue}, {EVENT.address}
        </p>

        <OrnamentalDivider />

        <div className="bg-navy-900/60 backdrop-blur-sm rounded-xl ornamental-border p-6 sm:p-10 mt-6">
          <RsvpPageClient guest={guest} token={token} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
