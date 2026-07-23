import React from 'react';
import * as Fa from 'react-icons/fa';
import * as Md from 'react-icons/md';
import * as Io5 from 'react-icons/io5';
import * as Tb from 'react-icons/tb';

interface IconRendererProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className, style }) => {
  // Use dynamic import lookup to avoid lint warnings about creating components during render
  const modules = { Fa, Md, Io5, Tb };
  
  for (const [prefix, module] of Object.entries(modules)) {
    if (name.startsWith(prefix)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const IconComponent = (module as any)[name];
      if (IconComponent) return <IconComponent className={className} style={style} />;
    }
  }

  // Fallback if not found or if name is a plain emoji
  return <span className={className} style={style}>{name || '🔗'}</span>;
};

export default IconRenderer;
