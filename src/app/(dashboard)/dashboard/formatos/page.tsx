import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, Trophy } from "lucide-react";

const FORMATS = [
  {
    rank: 1,
    title: "Formato de Problema",
    description: "Hacer consciente del problema al cliente con una situación real incómoda. Muestra el día a día del cliente ideal de forma que diga \"eso me pasa a mí\".",
    tip: "Empieza describiendo la situación incómoda, amplifica el dolor y después revela la verdadera causa.",
    example: {
      label: "Ver ejemplo en Instagram",
      url: "https://www.instagram.com/p/DZgndo-zBCF/",
    },
  },
  {
    rank: 2,
    title: "Contenido Orgánico Hablando a Cámara",
    description: "El formato más directo y auténtico. Hablar frente a cámara genera conexión inmediata y te posiciona como autoridad en tu nicho.",
    tip: "Usa un gancho fuerte en los primeros 3 segundos. Mantén energía alta y mira directo a la cámara.",
    example: {
      label: "Ver ejemplo en TikTok",
      url: "https://vt.tiktok.com/ZSQgSB8G3/",
    },
  },
  {
    rank: 3,
    title: "Formato Pregunta de Instagram",
    description: "Usa la caja de preguntas de Instagram para responder dudas reales de tu audiencia. Genera engagement y demuestra expertise.",
    tip: "Responde preguntas que tu cliente ideal haría. Aporta valor real en cada respuesta.",
    example: {
      label: "Ver ejemplo en Instagram",
      url: "https://www.instagram.com/p/DZbOQ5KstWI/",
    },
  },
];

export default function FormatosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Top Formatos de Contenido</h1>
        <p className="text-muted-foreground mt-1">
          Los mejores formatos para crear contenido que genera alcance y conversiones
        </p>
      </div>

      <div className="space-y-4">
        {FORMATS.map((format) => (
          <Card key={format.rank}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-bold">#{format.rank}</Badge>
                    <CardTitle className="text-base">{format.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-1">{format.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-sm"><span className="font-semibold">Tip:</span> {format.tip}</p>
              </div>
              <a
                href={format.example.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Play className="h-4 w-4" />
                {format.example.label}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recuerda: El 70% de importancia está en el gancho</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            El gancho puede ser textual, visual o verbal — y si son los 3 mucho mejor.
            Un buen gancho determina si tu video se ve o se ignora.
            Invertí la mayor parte de tu tiempo creativo en los primeros 3 segundos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
