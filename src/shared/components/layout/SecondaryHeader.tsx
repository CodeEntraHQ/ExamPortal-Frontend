import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface SecondaryHeaderProps {
  breadcrumbItems?: BreadcrumbItem[];
  onBack?: () => void;
}

export function SecondaryHeader({ breadcrumbItems = [], onBack }: SecondaryHeaderProps) {
  // Don't render if there's nothing to show
  if (!onBack && breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="sticky top-16 z-40 w-full"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-12 items-center">
          {/* Left: Back Button */}
          <div className="flex items-center gap-2 mr-8">
            {onBack && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="gap-2 hover:bg-accent transition-all duration-200"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </motion.div>
            )}
          </div>

          {/* Center: Breadcrumb Navigation - Aligned with main header center */}
          {breadcrumbItems.length > 0 && (
            <div className="flex-1 flex justify-center">
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="hidden md:flex items-center space-x-1.5 text-sm"
                aria-label="Breadcrumb"
              >
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
                    {item.onClick && !item.isActive ? (
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={item.onClick}
                          className="h-auto px-2 py-1 text-muted-foreground hover:text-foreground font-normal text-sm transition-all duration-200 relative overflow-hidden group"
                        >
                          <span className="relative z-10 transition-colors duration-200">
                            {item.label}
                          </span>
                          <motion.span
                            className="absolute inset-0 bg-primary/10 rounded-md"
                            initial={{ scale: 0, opacity: 0 }}
                            whileHover={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.span
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`px-2 py-1 ${
                          item.isActive
                            ? 'text-foreground font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </React.Fragment>
                ))}
              </motion.nav>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}

