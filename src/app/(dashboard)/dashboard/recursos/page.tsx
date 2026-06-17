import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, MessageSquare, ExternalLink } from "lucide-react";

const RESOURCE_SECTIONS = [
  {
    title: "Manuales de Ventas",
    icon: FileText,
    description: "Guías completas para cerrar ventas de forma natural",
    resources: [
      {
        title: "Manual de Ventas Conecta",
        url: "https://docs.google.com/document/d/1Aj2ifRcEeIPZEu5KKQy2v98uBbFHgwzYB3VikqcM2hw/edit?usp=drive_link",
        tag: "Principal",
      },
      {
        title: "¿Cuándo el Descubrimiento está terminado?",
        url: "https://docs.google.com/document/d/1bQiob63vZ1qTPcrUCuZQ70xsSOwiFlYShFKYPhXDqQ4/edit?usp=drive_link",
        tag: "Descubrimiento",
      },
      {
        title: "Cómo Generar Urgencia de Forma Natural",
        url: "https://docs.google.com/document/d/1HQaMb3q46lBwOXtpbWfxLHnnD8F2_fp2q3tg6rC36RU/edit?usp=drive_link",
        tag: "Urgencia",
      },
    ],
  },
  {
    title: "Recursos para Mensajes",
    icon: MessageSquare,
    description: "Plantillas y estrategias para setteo de mensajes",
    resources: [
      {
        title: "¿Qué es SETTEO?",
        url: "https://docs.google.com/document/d/1H5frRwMthSZANkMz9bZQPPS5UHQ5PxH6/edit?usp=drive_link&ouid=117209292614888247800&rtpof=true&sd=true",
        tag: "Setteo",
      },
    ],
  },
  {
    title: "Marca Personal",
    icon: BookOpen,
    description: "Recursos para construir tu marca personal antes de crear contenido",
    resources: [
      {
        title: "Importantes antes de Crear Contenido",
        url: "https://docs.google.com/spreadsheets/d/1n_c2TcbQ59kAa-se5UKI9umWaeHItIMi1cJdMJWms9c/edit?gid=1487623315#gid=1487623315",
        tag: "Excel de Ideales",
      },
    ],
  },
];

export default function RecursosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Recursos</h1>
        <p className="text-muted-foreground mt-1">
          Manuales, plantillas y guías para complementar tu estrategia de contenido
        </p>
      </div>

      <div className="space-y-4">
        {RESOURCE_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.resources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{resource.title}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">{resource.tag}</Badge>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
