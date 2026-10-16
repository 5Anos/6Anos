import React from 'react';

interface MetacognitionWidgetProps {
  missionId?: string;
  worldId?: number;
  topicId?: string;
  worldThemeColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
  questionPrompt?: string;
  options?: string[];
}

export const MetacognitionWidget: React.FC<MetacognitionWidgetProps> = () => {
  return null;
};
