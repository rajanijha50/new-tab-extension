import React from 'react';
import * as Fa from 'react-icons/fa';
import * as Md from 'react-icons/md';
import * as Io5 from 'react-icons/io5';
import * as Tb from 'react-icons/tb';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  if (name.startsWith('Fa')) {
    const IconComponent = (Fa as any)[name];
    if (IconComponent) return <IconComponent className={className} />;
  } else if (name.startsWith('Md')) {
    const IconComponent = (Md as any)[name];
    if (IconComponent) return <IconComponent className={className} />;
  } else if (name.startsWith('Io')) {
    const IconComponent = (Io5 as any)[name];
    if (IconComponent) return <IconComponent className={className} />;
  } else if (name.startsWith('Tb')) {
    const IconComponent = (Tb as any)[name];
    if (IconComponent) return <IconComponent className={className} />;
  }

  // Fallback if not found or if name is a plain emoji
  return <span className={className}>{name || '🔗'}</span>;
};

export default IconRenderer;
