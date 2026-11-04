import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionTitle } from "@/components/SectionTitle";
import { BUSINESS } from "@/config/business";

/**
 * ⚠️ ESBORRANYS: aquests textos són una estructura orientativa per al prototip.
 * Els ha de redactar i revisar un professional (gestor/advocat) abans de vendre.
 * Qui és el titular i qui factura encara no està decidit (vegeu config/business.ts).
 */
const PAGES: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  condicions: {
    title: "Condicions de compra",
    sections: [
      { h: "Titular", p: `Pendent de definir qui ven i factura (${BUSINESS.billingEntity}): raó social, NIF i domicili.` },
      { h: "Productes", p: "Pizzes i bases envasades al buit, elaborades a l'obrador. La informació d'ingredients i al·lèrgens és a la fitxa de cada producte." },
      { h: "Preus", p: "Els preus inclouen l'IVA (tipus pendent de confirmar amb el gestor). L'enviament es mostra abans de pagar." },
      { h: "Comandes i pagament", p: "Les comandes es fan per encàrrec abans de l'hora límit de cada zona. El pagament es fa en línia en el moment de la comanda." },
    ],
  },
  enviaments: {
    title: "Enviaments",
    sections: [
      { h: "Zones", p: "Entreguem a les poblacions on hi ha pizzeria La Mia Pizza. Comprova el teu codi postal al procés de comanda." },
      { h: "Dies i franges", p: "Els dies, franges horàries, cost i mínim de comanda es mostren al procés de compra. Pendent de confirmar." },
      { h: "Cadena de fred", p: "Pendent de definir com es garanteix la temperatura durant el repartiment." },
    ],
  },
  devolucions: {
    title: "Devolucions",
    sections: [
      { h: "Productes peribles", p: "Pendent de revisar: els aliments peribles poden quedar exempts del dret de desistiment (art. 103 de la Llei general per a la defensa dels consumidors)." },
      { h: "Incidències", p: "Si el producte arriba en mal estat, contacta'ns el mateix dia. Canal de contacte pendent de definir." },
    ],
  },
  privacitat: {
    title: "Política de privacitat",
    sections: [
      { h: "Responsable", p: "Pendent de definir el responsable del tractament i les dades de contacte." },
      { h: "Dades que recollim", p: "Nom, telèfon, correu electrònic i adreça d'entrega, només per gestionar la comanda i l'entrega." },
      { h: "Conservació i drets", p: "Pendent de redactar: termini de conservació i com exercir els drets d'accés, rectificació i supressió (RGPD)." },
      { h: "Pagament", p: "Les dades de la targeta les gestiona la passarel·la de pagament; la web no les desa." },
    ],
  },
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: PAGES[(await params).slug]?.title };
}

export default async function LegalPage({ params }: Props) {
  const page = PAGES[(await params).slug];
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-2xl">
      <SectionTitle as="h1">{page.title}</SectionTitle>
      <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900">
        ⚠️ Esborrany del prototip. Text pendent de redactar i revisar per un professional.
      </p>
      {page.sections.map((s) => (
        <section key={s.h} className="mt-6">
          <h2 className="font-display text-2xl">{s.h}</h2>
          <p className="mt-1 leading-relaxed text-ink-soft">{s.p}</p>
        </section>
      ))}
    </article>
  );
}
