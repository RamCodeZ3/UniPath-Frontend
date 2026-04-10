import { Chip } from 'primereact/chip';

interface DocumentRecommendationCardProps {
  answer?: string | null;
  loading: boolean;
  error?: string | null;
  documentsUsed?: number;
}

type SectionType = 'list' | 'chips' | 'text';

interface Section {
  type: SectionType;
  title?: string;
  items?: string[];
  text?: string;
}

const parseAnswer = (raw: string): Section[] => {
  const sections: Section[] = [];
  const lines = raw.split('\n');

  let current: Section | null = null;
  let textBuffer: string[] = [];

  const flush = () => {
    if (!current) return;
    if (textBuffer.length > 0) {
      current.text = textBuffer.join(' ').trim();
      textBuffer = [];
    }
    sections.push(current);
    current = null;
  };

  const itemPatterns = [
    /^- (.+)/,
    /^\* (.+)/,
    /^(\d+[\.\)]\s*)(.+)/,
    /^[-*]\s+\*\*(.+?)\*\*(.*)/,
  ];

  const isInvalidDocText = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
      lower.includes('el documento que subiste') ||
      lower.includes('no corresponde a ninguno') ||
      lower.includes('no es válido') ||
      lower.includes('no está contemplado') ||
      lower.includes('ticket_') ||
      /\.png$/i.test(text) ||
      /\.jpg$/i.test(text) ||
      /\.pdf$/i.test(text)
    );
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flush();
      const title = trimmed.replace(/\*\*/g, '');
      const isDocumentsMissing = title.toLowerCase().includes('documentos faltantes') ||
                                 title.toLowerCase().includes('documentos que faltan');
      const isEstadoGeneral = title.toLowerCase().includes('estado general');
      const isText =
        title.toLowerCase().includes('recomendaci') ||
        title.toLowerCase().includes('nota');

      let sectionType: SectionType = 'list';
      if (isDocumentsMissing) {
        sectionType = 'chips';
      } else if (isEstadoGeneral) {
        sectionType = 'text';
      } else if (isText) {
        sectionType = 'text';
      }

      current = {
        type: sectionType,
        title,
        items: [],
      };
      continue;
    }

    let matched = false;
    for (const pattern of itemPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const item = match[match.length - 1].replace(/\*\*/g, '').trim();
        if (item && current) {
          current.items = [...(current.items ?? []), item];
          matched = true;
          break;
        }
      }
    }

    if (!matched && trimmed && current) {
      if (current.type === 'chips' && isInvalidDocText(trimmed)) {
        continue;
      }
      textBuffer.push(trimmed);
    }
  }

  flush();
  return sections;
};

export const DocumentRecommendationCard = ({
  answer,
  loading,
  error,
  documentsUsed,
}: DocumentRecommendationCardProps) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <p className="text-gray-600">Analizando tus documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('[DocumentRecommendation] Error:', error);
    return null;
  }

  if (!answer) return null;

  const sections = parseAnswer(answer);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">Análisis de documentos</h3>
        </div>
        {documentsUsed !== undefined && (
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
            {documentsUsed} documento{documentsUsed !== 1 ? 's' : ''} analizado
            {documentsUsed !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="text-sm space-y-4">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <h4 className="font-bold text-gray-900 mb-2">{section.title}</h4>
            )}

            {section.type === 'chips' && (section.items?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {section.items!.map((item, j) => (
                  <Chip
                    key={j}
                    label={item}
                    className="bg-amber-100 text-amber-800 border-amber-200"
                  />
                ))}
              </div>
            )}

            {section.type === 'chips' && section.text && (
              <p className="text-gray-700 leading-relaxed mt-2">{section.text}</p>
            )}

            {section.type === 'list' && (section.items?.length ?? 0) > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {section.items!.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}

            {section.type === 'text' && section.text && (
              <p className="text-gray-700 leading-relaxed">{section.text}</p>
            )}

            {section.type === 'text' && (section.items?.length ?? 0) > 0 && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {section.items!.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};