import React from 'react';
import { Button } from '../ui/button';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-6"
      aria-label="Breadcrumb"
    >
      <Home className="h-4 w-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.onClick && !item.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              className="h-auto p-0 text-muted-foreground hover:text-foreground font-normal"
            >
              {item.label}
            </Button>
          ) : (
            <span className={item.isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
}