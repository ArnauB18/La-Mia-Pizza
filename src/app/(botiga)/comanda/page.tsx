import type { Metadata } from "next";
import { CheckoutForm } from "./CheckoutForm";
import { t } from "@/messages";

export const metadata: Metadata = { title: t.checkout.title };

export default function CheckoutPage() {
  return <CheckoutForm />;
}
