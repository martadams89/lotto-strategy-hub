import React from "react";
import { ShieldCheck, Dice5, Database, HeartHandshake } from "lucide-react";

export const AboutView: React.FC = () => (
  <div className="space-y-6 max-w-2xl">
    <div>
      <h2 className="font-display text-2xl font-semibold">About this tool</h2>
      <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
        Honest by design. Here’s exactly what it does and doesn’t do.
      </p>
    </div>

    <Card icon={Dice5} title="It cannot predict the draw — and never claims to">
      <p>
        EuroMillions and UK Lotto draws are physically random and independent. Past results tell you
        nothing about the next draw: a number that hasn’t shown for months is no more “due” than any
        other. No statistical model or AI can beat this, because there’s no pattern to beat. Anyone
        who tells you otherwise is guessing or selling something.
      </p>
    </Card>

    <Card icon={ShieldCheck} title="The one real edge: don’t share your prize">
      <p>
        You can’t change your odds of winning, but you can change how much you’d <em>keep</em> if you
        did. Jackpots are split between everyone who matches. Most players crowd onto birthdays
        (1–31), “lucky” numbers, and tidy patterns — so a win on those numbers is often shared many
        ways.
      </p>
      <p>
        Your numbers here are generated to lean away from that crowd while still looking like a
        natural line (a believable spread and sum). The <strong>rarity score</strong> estimates how
        uncrowded a line is. It’s an estimate of human behaviour, not a measured certainty — and to
        be crystal clear, it does not improve your chance of winning at all.
      </p>
    </Card>

    <Card icon={Database} title="Where the numbers come from">
      <p>
        The archive holds every UK Lotto draw since 1994 and every EuroMillions draw since 2004,
        sourced from the official results and refreshed automatically after each draw. Every row is
        validated on the way in and on the way out, so a malformed result can never reach this page.
        We only store what’s verifiable — the dates and the balls — and never invent jackpot figures
        or winner counts.
      </p>
    </Card>

    <Card icon={HeartHandshake} title="Please play responsibly">
      <p>
        The lottery is entertainment with a negative expected return — on average you get back less
        than you put in. Never spend money you can’t comfortably lose, and never chase losses. If
        gambling stops being fun, free, confidential help is available at{" "}
        <a
          href="https://www.begambleaware.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          BeGambleAware.org
        </a>{" "}
        or the National Gambling Helpline on 0808 8020 133.
      </p>
    </Card>
  </div>
);

const Card: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 sm:p-6">
    <h3 className="flex items-center gap-2 font-medium">
      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      {title}
    </h3>
    <div className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed space-y-3 mt-3">
      {children}
    </div>
  </section>
);
