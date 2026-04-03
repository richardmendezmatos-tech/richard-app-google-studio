import { PersuasionProfile } from '@/features/leads/model/customerMemoryService';
import { IntentMatrix } from '@/features/leads/model/scoring/IntentAnalysisService';

interface PersuasionWrapperProps {
  profile: PersuasionProfile;
  intentMatrix?: IntentMatrix;
  sentimentVelocity?: number;
  variants: {
    Analytical: React.ReactNode;
    Impulsive: React.ReactNode;
    Conservative: React.ReactNode;
    HighUrgency?: React.ReactNode; // Nivel 17
    Unknown?: React.ReactNode;
  };
}

/**
 * PersuasionWrapper: El corazón de la UI Adaptativa (Nivel 16/17).
 * Inyecta variaciones de contenido basadas en el perfil cognitivo y la matriz de intención.
 */
export const PersuasionWrapper: React.FC<PersuasionWrapperProps> = ({
  profile,
  intentMatrix,
  sentimentVelocity = 0,
  variants,
}) => {
  // Nivel 18: Adaptive Motion Calculation
  // A mayor urgencia, menor duración (más rápido). Rango: 0.2s - 0.7s
  const motionDuration = intentMatrix 
    ? `${Math.max(0.2, 0.7 - intentMatrix.urgency * 0.5)}s`
    : '0.5s';

  const containerStyle = {
    '--ra-motion-duration': motionDuration,
  } as React.CSSProperties;

  // Lógica de Nivel 17: Prioridad por Urgencia Crítica
  if (intentMatrix && intentMatrix.urgency > 0.8 && variants.HighUrgency) {
    return (
      <div 
        className="animate-in zoom-in-95 duration-500 border-2 border-primary/20 rounded-xl p-1 bg-primary/5"
        style={containerStyle}
      >
        {variants.HighUrgency}
      </div>
    );
  }

  // Sentiment Velocity Feedback (Visual subtle)
  const velocityClass = sentimentVelocity > 0.2 ? 'ring-1 ring-green-500/30' : '';

  const content = variants[profile as keyof typeof variants] || variants.Unknown || variants.Analytical;

  return (
    <div 
      className={`animate-in fade-in ${velocityClass}`}
      style={containerStyle}
    >
      {content}
    </div>
  );
};
