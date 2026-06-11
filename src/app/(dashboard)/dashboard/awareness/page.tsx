import { AwarenessClient } from "@/components/modules/awareness-client";

export default function AwarenessPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nivel de Conciencia</h1>
        <p className="text-muted-foreground mt-1">
          Generá guiones adaptados según dónde está tu cliente en su camino de compra
        </p>
      </div>
      <AwarenessClient />
    </div>
  );
}
